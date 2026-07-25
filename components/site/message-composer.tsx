"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Sparkles, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { publishMessageAction } from "@/app/studio/actions";
import {
  fileDownloadUrl,
  fileViewUrl,
  hasAppwritePublicConfig,
} from "@/lib/appwrite";
import type { Message } from "@/lib/messages";
import { cn } from "@/lib/utils";

const FALLBACK_THUMB =
  "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1600&q=70";

export interface ComposerUploads {
  videoFileId?: string;
  videoSize?: number;
  audioFileId?: string;
  audioSize?: number;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function durationToSeconds(value: string) {
  const parts = value.split(":").map(Number).filter((n) => !Number.isNaN(n));
  if (parts.length === 0) return 0;
  return parts.reduce((total, part) => total * 60 + part, 0);
}

function secondsToDuration(total: number) {
  if (!total) return "";
  const s = total % 60;
  const m = Math.floor((total / 60) % 60);
  const h = Math.floor(total / 3600);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/**
 * Publishes a message straight to the Appwrite database. Handed the file ids of
 * whatever was just uploaded, it builds the playback URLs, writes the record,
 * and the message goes live across the site no code edit, no redeploy.
 */
export function MessageComposer({
  uploads,
  existing,
  speakerOptions = [],
  seriesOptions = [],
  onPublished,
}: {
  uploads?: ComposerUploads;
  existing?: Message;
  speakerOptions?: string[];
  seriesOptions?: string[];
  onPublished?: () => void;
}) {
  const [title, setTitle] = useState(existing?.title ?? "");
  const [speaker, setSpeaker] = useState(existing?.speaker ?? "");
  const [series, setSeries] = useState(existing?.series ?? "");
  const [date, setDate] = useState(
    existing?.date ?? new Date().toISOString().slice(0, 10),
  );
  const [scripture, setScripture] = useState(existing?.scripture ?? "");
  const [summary, setSummary] = useState(existing?.summary ?? "");
  const [duration, setDuration] = useState(
    existing ? secondsToDuration(existing.durationSeconds) : "",
  );
  const [thumbnail, setThumbnail] = useState(
    existing && existing.thumbnail !== FALLBACK_THUMB ? existing.thumbnail : "",
  );
  const [featured, setFeatured] = useState(Boolean(existing?.featured));
  const [videoFileId, setVideoFileId] = useState("");
  const [videoSize, setVideoSize] = useState(existing?.video?.sizeBytes ?? 0);
  const [audioFileId, setAudioFileId] = useState("");
  const [audioSize, setAudioSize] = useState(existing?.audio?.sizeBytes ?? 0);

  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (uploads?.videoFileId) setVideoFileId(uploads.videoFileId);
    if (uploads?.videoSize) setVideoSize(uploads.videoSize);
    if (uploads?.audioFileId) setAudioFileId(uploads.audioFileId);
    if (uploads?.audioSize) setAudioSize(uploads.audioSize);
  }, [uploads]);

  // For edits, seed the existing playback URLs so the record round-trips even
  // if no new file was uploaded this session.
  const existingVideoSrc = existing?.video?.src;
  const existingAudioUrl = existing?.audio?.url;

  const configured = hasAppwritePublicConfig();

  const message = useMemo<Message>(() => {
    const videoSrc = videoFileId ? fileViewUrl(videoFileId) : existingVideoSrc;
    const audioUrl = audioFileId ? fileViewUrl(audioFileId) : existingAudioUrl;
    const formats: Message["formats"] = [];
    if (videoSrc) formats.push("video");
    if (audioUrl) formats.push("audio");

    return {
      id: existing?.id,
      slug: slugify(title) || existing?.slug || "untitled",
      title: title || "Untitled",
      speaker,
      series,
      date,
      scripture,
      summary,
      thumbnail: thumbnail || FALLBACK_THUMB,
      durationSeconds: durationToSeconds(duration),
      formats,
      video: videoSrc
        ? {
            src: videoSrc,
            downloadUrl: videoFileId
              ? fileDownloadUrl(videoFileId)
              : existing?.video?.downloadUrl,
            sizeBytes: videoSize || undefined,
          }
        : undefined,
      audio: audioUrl
        ? {
            url: audioUrl,
            downloadUrl: audioFileId
              ? fileDownloadUrl(audioFileId)
              : existing?.audio?.downloadUrl,
            sizeBytes: audioSize || undefined,
          }
        : undefined,
      tags: existing?.tags,
      notes: existing?.notes,
      featured,
    };
  }, [
    title,
    speaker,
    series,
    date,
    scripture,
    summary,
    thumbnail,
    duration,
    featured,
    videoFileId,
    videoSize,
    audioFileId,
    audioSize,
    existing,
    existingVideoSrc,
    existingAudioUrl,
  ]);

  const canPublish =
    title.trim().length > 1 &&
    (message.video || message.audio) &&
    status !== "saving";

  async function publish() {
    setStatus("saving");
    setError(null);
    const res = await publishMessageAction(message);
    if (res.ok) {
      setStatus("done");
      onPublished?.();
      if (!existing) {
        // Reset for the next message.
        setTimeout(() => {
          setTitle("");
          setSpeaker("");
          setSeries("");
          setScripture("");
          setSummary("");
          setDuration("");
          setThumbnail("");
          setFeatured(false);
          setVideoFileId("");
          setAudioFileId("");
          setStatus("idle");
        }, 1400);
      }
    } else {
      setStatus("error");
      setError(res.error);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="c-title">Message title</Label>
          <Input
            id="c-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="The Grace That Goes First"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="c-speaker">Speaker</Label>
            <Input
              id="c-speaker"
              value={speaker}
              onChange={(e) => setSpeaker(e.target.value)}
              list="speakers"
              placeholder="Pastor Samuel Adjei"
            />
            <datalist id="speakers">
              {speakerOptions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>

          <div className="space-y-2">
            <Label htmlFor="c-series">Series</Label>
            <Input
              id="c-series"
              value={series}
              onChange={(e) => setSeries(e.target.value)}
              list="series"
              placeholder="Rooted in Grace"
            />
            <datalist id="series">
              {seriesOptions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="c-date">Service date</Label>
            <Input
              id="c-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-duration">Length (mm:ss or h:mm:ss)</Label>
            <Input
              id="c-duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="45:35"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="c-scripture">Scripture</Label>
          <Input
            id="c-scripture"
            value={scripture}
            onChange={(e) => setScripture(e.target.value)}
            placeholder="Ephesians 2:1–10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="c-summary">Summary</Label>
          <Textarea
            id="c-summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            placeholder="One or two sentences that make someone want to press play."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="c-thumb">Thumbnail URL</Label>
          <Input
            id="c-thumb"
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
            placeholder="Paste an image URL, or leave blank for a default"
            className="text-xs"
          />
        </div>

        <button
          type="button"
          onClick={() => setFeatured((v) => !v)}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors",
            featured
              ? "border-gold bg-gold/10"
              : "border-border hover:border-foreground/30",
          )}
        >
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full",
              featured ? "bg-gold text-ink" : "bg-muted text-muted-foreground",
            )}
          >
            <Star className={cn("h-4 w-4", featured && "fill-current")} />
          </span>
          <span>
            <span className="block text-sm font-medium">Feature on the home page</span>
            <span className="block text-xs text-muted-foreground">
              The featured message headlines the homepage.
            </span>
          </span>
        </button>
      </div>

      {/* -------------------------------------------------- publish panel */}
      <div className="lg:sticky lg:top-6 lg:h-fit">
        <div className="rounded-2xl border border-border/70 bg-card p-6">
          <h3 className="font-display text-lg font-semibold">Ready to publish</h3>
          <dl className="mt-4 space-y-2 text-sm">
            <Row label="Video" value={message.video ? "attached" : "—"} />
            <Row label="Audio" value={message.audio ? "attached" : "—"} />
            <Row
              label="Slug"
              value={<code className="font-mono text-xs">{message.slug}</code>}
            />
          </dl>

          {!configured && (
            <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-muted-foreground">
              Appwrite public config missing playback URLs can&apos;t be built.
            </p>
          )}

          {error && (
            <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
              {error}
            </p>
          )}

          <Button
            onClick={publish}
            disabled={!canPublish}
            className="mt-5 h-12 w-full rounded-full bg-gold font-semibold text-ink hover:bg-gold/90"
          >
            {status === "saving" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing…
              </>
            ) : status === "done" ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Published
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {existing ? "Save changes" : "Publish message"}
              </>
            )}
          </Button>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            {existing
              ? "Updates go live immediately."
              : "Needs a title and at least one uploaded file."}
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 pb-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
