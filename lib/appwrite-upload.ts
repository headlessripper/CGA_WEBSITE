import { Account, Client } from "appwrite";

import { appwrite, generateFileId } from "@/lib/appwrite";

/**
 * Direct, resumable browser → Appwrite upload for Vercel.
 *
 * On Vercel the old relay is impossible: a 5 MB Appwrite chunk exceeds the
 * serverless request-body limit. So the file goes straight from the browser to
 * Appwrite Storage, and Vercel is only involved to authorize it:
 *
 *   1. POST /api/appwrite/session (Clerk-gated) → a one-time token for the
 *      dedicated uploader account.
 *   2. Exchange it for an Appwrite session, then a short-lived JWT.
 *   3. PUT the file to Appwrite in 5 MB chunks, authorised by the JWT, which we
 *      refresh as it nears expiry so multi-hour uploads keep going.
 *
 * A dropped connection retries a single chunk; the upload can be paused,
 * resumed and cancelled.
 */

export const APPWRITE_CHUNK_SIZE = 5 * 1024 * 1024;
const MAX_RETRIES = 6;
const JWT_TTL_MS = 14 * 60 * 1000; // refresh a little before the 15-min expiry

export interface UploadHandle {
  done: Promise<string>;
  pause: () => void;
  resume: () => void;
  abort: () => void;
}

export interface UploadOptions {
  file: File;
  onProgress?: (p: {
    uploaded: number;
    total: number;
    percent: number;
    speed: number;
    eta: number | null;
  }) => void;
  onStatus?: (
    status: "preparing" | "uploading" | "paused" | "retrying" | "done" | "error",
  ) => void;
}

export function uploadToAppwrite({
  file,
  onProgress,
  onStatus,
}: UploadOptions): UploadHandle {
  const fileId = generateFileId();
  let offset = 0;
  let paused = false;
  let aborted = false;
  let resumeSignal: (() => void) | null = null;
  let controller: AbortController | null = null;

  let account: Account | null = null;
  let jwt = "";
  let jwtAt = 0;

  const samples: { at: number; bytes: number }[] = [];

  function report() {
    const now = Date.now();
    samples.push({ at: now, bytes: offset });
    while (samples.length > 6) samples.shift();
    let speed = 0;
    if (samples.length >= 2) {
      const a = samples[0];
      const b = samples[samples.length - 1];
      const secs = (b.at - a.at) / 1000;
      if (secs > 0) speed = (b.bytes - a.bytes) / secs;
    }
    onProgress?.({
      uploaded: offset,
      total: file.size,
      percent: file.size ? (offset / file.size) * 100 : 0,
      speed,
      eta: speed > 0 ? Math.round((file.size - offset) / speed) : null,
    });
  }

  async function waitWhilePaused() {
    if (!paused) return;
    onStatus?.("paused");
    await new Promise<void>((resolve) => {
      resumeSignal = resolve;
    });
    onStatus?.("uploading");
  }

  async function ensureJwt() {
    if (!account) throw new Error("No Appwrite session.");
    if (jwt && Date.now() - jwtAt < JWT_TTL_MS) return jwt;
    const res = await account.createJWT();
    jwt = res.jwt;
    jwtAt = Date.now();
    return jwt;
  }

  async function prepare() {
    onStatus?.("preparing");

    const res = await fetch("/api/appwrite/session", { method: "POST" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Could not authorise the upload.");

    const client = new Client()
      .setEndpoint(appwrite.endpoint)
      .setProject(appwrite.projectId);
    account = new Account(client);
    await account.createSession(data.userId, data.secret);
    await ensureJwt();
  }

  async function sendChunk(start: number, end: number, attempt = 0): Promise<void> {
    controller = new AbortController();
    const form = new FormData();
    form.append("fileId", fileId);
    form.append("file", file.slice(start, end), file.name);

    try {
      const token = await ensureJwt();
      const res = await fetch(
        `${appwrite.endpoint}/storage/buckets/${appwrite.bucketId}/files`,
        {
          method: "POST",
          headers: {
            "X-Appwrite-Project": appwrite.projectId,
            "X-Appwrite-JWT": token,
            "X-Appwrite-ID": fileId,
            "Content-Range": `bytes ${start}-${end - 1}/${file.size}`,
          },
          body: form,
          signal: controller.signal,
        },
      );

      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(detail.message ?? `Upload failed (status ${res.status}).`);
      }
      offset = end;
    } catch (err) {
      if (aborted) throw err;
      if (paused) {
        await waitWhilePaused();
        return sendChunk(start, end, attempt);
      }
      if (attempt >= MAX_RETRIES) throw err;
      onStatus?.("retrying");
      await new Promise((r) => setTimeout(r, Math.min(2 ** attempt * 1000, 16000)));
      onStatus?.("uploading");
      return sendChunk(start, end, attempt + 1);
    }
  }

  const done = (async () => {
    await prepare();
    onStatus?.("uploading");
    report();

    do {
      if (aborted) throw new Error("Upload cancelled");
      await waitWhilePaused();
      if (aborted) throw new Error("Upload cancelled");

      const end = Math.min(offset + APPWRITE_CHUNK_SIZE, file.size);
      await sendChunk(offset, end);
      report();
    } while (offset < file.size);

    onStatus?.("done");
    return fileId;
  })();

  done.catch(() => onStatus?.("error"));

  return {
    done,
    pause: () => {
      paused = true;
      controller?.abort();
    },
    resume: () => {
      paused = false;
      resumeSignal?.();
      resumeSignal = null;
    },
    abort: () => {
      aborted = true;
      paused = false;
      resumeSignal?.();
      controller?.abort();
    },
  };
}
