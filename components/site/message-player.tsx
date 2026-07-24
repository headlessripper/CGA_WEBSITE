"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import {
  Download,
  Headphones,
  Info,
  Pause,
  Play,
  Share2,
  Video as VideoIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Equalizer, useAudio } from "@/components/site/audio-provider";
import { VideoPlayer } from "@/components/site/video-player";
import type { Message } from "@/lib/messages";
import { cn, formatBytes, formatDuration } from "@/lib/utils";

type Mode = "video" | "audio";

export function MessagePlayer({ message }: { message: Message }) {
  const audio = useAudio();
  const hasVideo = Boolean(message.video);
  const hasAudio = Boolean(message.audio);
  const [mode, setMode] = useState<Mode>(hasVideo ? "video" : "audio");
  const [copied, setCopied] = useState(false);

  const playingThis = audio.isPlaying(message.slug);

  function startAudio() {
    if (!message.audio) return;
    audio.play({
      slug: message.slug,
      title: message.title,
      speaker: message.speaker,
      src: message.audio.url,
      artwork: message.thumbnail,
    });
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: message.title, url });
        return;
      } catch {
        // The user dismissed the share sheet — fall through to copying.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard blocked; nothing useful left to try.
    }
  }

  return (
    <div>
      {/* Format switch — only shown when both formats exist. */}
      {hasVideo && hasAudio && (
        <div className="mb-4 flex items-center gap-1 rounded-full bg-muted p-1 sm:w-fit">
          {(["video", "audio"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "relative flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-colors sm:flex-none",
                mode === m ? "text-ink" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {mode === m && (
                <motion.span
                  layoutId="player-mode"
                  className="absolute inset-0 -z-10 rounded-full bg-gold"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              {m === "video" ? (
                <VideoIcon className="h-4 w-4" />
              ) : (
                <Headphones className="h-4 w-4" />
              )}
              {m === "video" ? "Watch" : "Listen"}
            </button>
          ))}
        </div>
      )}

      {mode === "video" && message.video ? (
        <VideoPlayer
          src={message.video.src}
          poster={message.thumbnail}
          title={message.title}
        />
      ) : (
        message.audio && (
          <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card">
            <div className="absolute inset-0">
              <Image
                src={message.thumbnail}
                alt=""
                fill
                sizes="100vw"
                className="object-cover opacity-20 blur-2xl"
              />
            </div>

            <div className="relative flex flex-col items-center gap-6 p-8 sm:flex-row sm:p-10">
              <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-2xl shadow-2xl">
                <Image
                  src={message.thumbnail}
                  alt=""
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              </div>

              <div className="min-w-0 flex-1 text-center sm:text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gradient-gold">
                  Audio message
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold leading-snug">
                  {message.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {message.speaker} · {formatDuration(message.durationSeconds)} ·{" "}
                  {formatBytes(message.audio.sizeBytes ?? 0)}
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                  <Button
                    onClick={startAudio}
                    size="lg"
                    className="rounded-full bg-gold font-semibold text-ink hover:bg-gold/90"
                  >
                    {playingThis ? (
                      <>
                        <Pause className="mr-2 h-4 w-4 fill-current" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4 fill-current" />
                        Play message
                      </>
                    )}
                  </Button>
                  <Equalizer active={playingThis} bars={5} className="flex" />
                </div>

                <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground sm:justify-start">
                  <Info className="h-3.5 w-3.5" />
                  Keeps playing while you browse the rest of the site.
                </p>
              </div>
            </div>
          </div>
        )
      )}

      {/* ------------------------------------------------- action bar */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {message.audio && mode === "video" && (
          <Button
            variant="outline"
            className="rounded-full font-semibold"
            onClick={startAudio}
          >
            <Headphones className="mr-2 h-4 w-4" />
            {playingThis ? "Pause audio" : "Play audio version"}
          </Button>
        )}

        {message.audio && (
          <Button asChild variant="outline" className="rounded-full font-semibold">
            <a href={message.audio.downloadUrl ?? message.audio.url} download>
              <Download className="mr-2 h-4 w-4" />
              MP3 · {formatBytes(message.audio.sizeBytes ?? 0)}
            </a>
          </Button>
        )}

        {message.video?.downloadUrl && (
          <Button asChild variant="outline" className="rounded-full font-semibold">
            <a href={message.video.downloadUrl} download>
              <Download className="mr-2 h-4 w-4" />
              Video file
              {message.video.sizeBytes
                ? ` · ${formatBytes(message.video.sizeBytes)}`
                : ""}
            </a>
          </Button>
        )}

        <Button
          variant="ghost"
          onClick={share}
          className="rounded-full font-semibold text-muted-foreground"
        >
          <Share2 className="mr-2 h-4 w-4" />
          {copied ? "Link copied" : "Share"}
        </Button>
      </div>

      {message.video?.sizeBytes && message.video.sizeBytes > 2 * 1024 ** 3 && (
        <p className="mt-3 text-xs text-muted-foreground">
          This recording is {formatBytes(message.video.sizeBytes)}. Playback
          streams only as far as you watch — but the download link is the whole
          file, so grab it on Wi-Fi. On mobile data, the audio-only version is
          far lighter.
        </p>
      )}
    </div>
  );
}
