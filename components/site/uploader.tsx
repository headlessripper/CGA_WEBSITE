"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  CheckCircle2,
  CloudUpload,
  FileAudio,
  FileVideo,
  Pause,
  Play,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { uploadToAppwrite, type UploadHandle } from "@/lib/appwrite-upload";
import { cn, formatBytes, formatDuration } from "@/lib/utils";

type Status =
  | "idle"
  | "preparing"
  | "uploading"
  | "paused"
  | "retrying"
  | "done"
  | "error";
type Kind = "video" | "audio";

export function Uploader({
  onUploaded,
}: {
  /** Called once the whole file is stored, with its Appwrite file id. */
  onUploaded?: (fileId: string, file: File, kind: Kind) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleRef = useRef<UploadHandle | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [percent, setPercent] = useState(0);
  const [uploaded, setUploaded] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [eta, setEta] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const start = useCallback(
    async (chosen: File) => {
      setFile(chosen);
      setError(null);
      setPercent(0);
      setUploaded(0);
      setStatus("preparing");

      const kind: Kind = chosen.type.startsWith("audio") ? "audio" : "video";

      const handle = uploadToAppwrite({
        file: chosen,
        onProgress: (p) => {
          setPercent(p.percent);
          setUploaded(p.uploaded);
          setSpeed(p.speed);
          setEta(p.eta);
        },
        onStatus: (s) => setStatus(s),
      });

      handleRef.current = handle;

      try {
        const fileId = await handle.done;
        onUploaded?.(fileId, chosen, kind);
      } catch (err) {
        if (err instanceof Error && err.message === "Upload cancelled") return;
        setError(err instanceof Error ? err.message : "The upload failed.");
      }
    },
    [onUploaded],
  );

  function reset() {
    handleRef.current?.abort();
    handleRef.current = null;
    setFile(null);
    setStatus("idle");
    setPercent(0);
    setError(null);
  }

  const busy =
    status === "preparing" ||
    status === "uploading" ||
    status === "paused" ||
    status === "retrying";
  const isAudio = file?.type.startsWith("audio");

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="video/*,audio/*"
        className="sr-only"
        onChange={(e) => {
          const chosen = e.target.files?.[0];
          if (chosen) void start(chosen);
        }}
      />

      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="drop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const dropped = e.dataTransfer.files?.[0];
                if (dropped) void start(dropped);
              }}
              className={cn(
                "flex w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-16 transition-colors",
                dragging
                  ? "border-gold bg-gold/10"
                  : "border-border hover:border-gold/50 hover:bg-card/60",
              )}
            >
              <motion.span
                animate={dragging ? { y: -6, scale: 1.08 } : { y: 0, scale: 1 }}
                className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 text-gold"
              >
                <CloudUpload className="h-7 w-7" />
              </motion.span>
              <p className="font-display text-xl font-semibold">
                Drop the service recording here
              </p>
              <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
                Video or audio, any size. The file streams to Appwrite Storage in
                5 MB chunks straight from this browser pause it, or let a
                dropped connection resume itself instead of starting over.
              </p>
              <span className="mt-6 rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-ink">
                Choose a file
              </span>
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="progress"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-3xl border border-border/70 bg-card p-6 sm:p-8"
          >
            <div className="flex items-start gap-4">
              <span
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                  status === "done" && "bg-gold/15 text-gold",
                  status === "error" && "bg-destructive/15 text-destructive",
                  busy && "bg-gold/15 text-gold",
                )}
              >
                {status === "done" ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : status === "error" ? (
                  <AlertTriangle className="h-6 w-6" />
                ) : isAudio ? (
                  <FileAudio className="h-6 w-6" />
                ) : (
                  <FileVideo className="h-6 w-6" />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{file.name}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {formatBytes(file.size)}
                  {busy && (
                    <>
                      {" · "}
                      {formatBytes(uploaded)} sent
                      {speed > 0 && ` · ${formatBytes(speed)}/s`}
                      {eta !== null && ` · ${formatDuration(eta)} left`}
                    </>
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={reset}
                aria-label="Cancel upload"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6">
              <Progress value={percent} className="h-2.5" />
              <div className="mt-2.5 flex items-center justify-between text-sm">
                <span
                  className={cn(
                    "font-medium",
                    status === "retrying" && "text-destructive",
                    status === "done" && "text-gold",
                  )}
                >
                  {status === "preparing" && "Authorising…"}
                  {status === "uploading" && "Uploading to Appwrite…"}
                  {status === "paused" && "Paused"}
                  {status === "retrying" && "Connection dropped retrying…"}
                  {status === "done" && "Stored in Appwrite. Details are ready below."}
                  {status === "error" && (error ?? "Upload failed")}
                </span>
                <span className="font-mono tabular-nums text-muted-foreground">
                  {percent.toFixed(1)}%
                </span>
              </div>
            </div>

            {busy && (
              <div className="mt-6 flex gap-3">
                {status === "paused" ? (
                  <Button
                    onClick={() => handleRef.current?.resume()}
                    className="rounded-full bg-gold font-semibold text-ink hover:bg-gold/90"
                  >
                    <Play className="mr-2 h-4 w-4 fill-current" />
                    Resume
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => handleRef.current?.pause()}
                    className="rounded-full font-semibold"
                  >
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </Button>
                )}
                <Button variant="ghost" onClick={reset} className="rounded-full">
                  Cancel
                </Button>
              </div>
            )}

            {(status === "done" || status === "error") && (
              <Button
                variant="outline"
                onClick={reset}
                className="mt-6 rounded-full font-semibold"
              >
                Upload another
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
