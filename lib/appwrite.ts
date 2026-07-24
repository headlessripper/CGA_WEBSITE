/**
 * Appwrite storage configuration + public URL helpers.
 *
 * Only the three NEXT_PUBLIC_* values live here, so this module is safe to
 * import from client components. The secret API key is used solely on the
 * server (see app/api/uploads/*) and never reaches the browser.
 *
 * Set these in .env.local:
 *   NEXT_PUBLIC_APPWRITE_ENDPOINT    e.g. https://cloud.appwrite.io/v1
 *   NEXT_PUBLIC_APPWRITE_PROJECT_ID
 *   NEXT_PUBLIC_APPWRITE_BUCKET_ID
 */

export const appwrite = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "",
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "",
  bucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID ?? "",
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ?? "main",
} as const;

/** Collection ids created by scripts/setup-appwrite.mjs. */
export const collections = {
  messages: "messages",
  events: "events",
  content: "content",
  connections: "connections",
} as const;

/** True when the public config needed to build playback URLs is present. */
export function hasAppwritePublicConfig() {
  return Boolean(appwrite.endpoint && appwrite.projectId && appwrite.bucketId);
}

function filesBase(fileId: string) {
  return `${appwrite.endpoint}/storage/buckets/${appwrite.bucketId}/files/${fileId}`;
}

/**
 * Inline playback URL for a stored file. Requires the bucket to grant
 * read("any") so sermons are publicly viewable. Appwrite honours HTTP range
 * requests on this endpoint, which is what lets the browser stream and seek a
 * multi-gigabyte recording without downloading it whole.
 */
export function fileViewUrl(fileId: string) {
  return `${filesBase(fileId)}/view?project=${appwrite.projectId}`;
}

/** Force-download URL — used for the "download the master" links. */
export function fileDownloadUrl(fileId: string) {
  return `${filesBase(fileId)}/download?project=${appwrite.projectId}`;
}

/** A 20-char preview thumbnail (Appwrite Image API) for image files only. */
export function fileThumbnailUrl(fileId: string, width = 1600) {
  return `${filesBase(fileId)}/preview?project=${appwrite.projectId}&width=${width}`;
}

/** Appwrite accepts an ID of up to 36 chars: [A-Za-z0-9._-], no leading punct. */
export function generateFileId() {
  // 32 hex chars from a UUID — always starts with a hex digit, always valid.
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "");
  }
  let out = "";
  for (let i = 0; i < 32; i++) out += Math.floor(Math.random() * 16).toString(16);
  return out;
}
