"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Clock, Headphones, Pause, Play, Video } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useAudio } from "@/components/site/audio-provider";
import type { Message } from "@/lib/messages";
import { cn, formatDuration, formatShortDate } from "@/lib/utils";

export function MessageCard({
  message,
  priority = false,
  className,
}: {
  message: Message;
  priority?: boolean;
  className?: string;
}) {
  const audio = useAudio();
  const hasAudio = Boolean(message.audio);
  const hasVideo = Boolean(message.video);
  const isPlaying = audio.isPlaying(message.slug);

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-shadow duration-300 hover:border-gold/40 hover:shadow-xl hover:shadow-gold/5",
        className,
      )}
    >
      <Link
        href={`/messages/${message.slug}`}
        className="relative block aspect-video overflow-hidden bg-muted"
      >
        <Image
          src={message.thumbnail}
          alt=""
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />

        <div className="absolute left-3 top-3 flex gap-1.5">
          {hasVideo && (
            <Badge className="gap-1 border-none bg-ink/70 text-[0.65rem] font-medium text-white backdrop-blur-sm hover:bg-ink/70">
              <Video className="h-3 w-3" /> Video
            </Badge>
          )}
          {hasAudio && (
            <Badge className="gap-1 border-none bg-ink/70 text-[0.65rem] font-medium text-white backdrop-blur-sm hover:bg-ink/70">
              <Headphones className="h-3 w-3" /> Audio
            </Badge>
          )}
        </div>

        <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-ink/70 px-2 py-0.5 font-mono text-[0.65rem] text-white backdrop-blur-sm">
          <Clock className="h-3 w-3" />
          {formatDuration(message.durationSeconds)}
        </span>

        {/* Watch affordance appears on hover / focus. */}
        <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/95 text-ink shadow-2xl transition-transform duration-300 group-hover:scale-100 motion-safe:scale-75">
            <Play className="ml-0.5 h-6 w-6 fill-current" />
          </span>
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground">
          <span className="text-gradient-gold">{message.series}</span>
          <span aria-hidden>·</span>
          <time dateTime={message.date}>{formatShortDate(message.date)}</time>
        </div>

        <h3 className="mt-2 font-display text-xl font-semibold leading-snug tracking-tight">
          <Link
            href={`/messages/${message.slug}`}
            className="transition-colors after:absolute after:inset-0 after:content-[''] hover:text-primary"
          >
            {message.title}
          </Link>
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {message.summary}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/60 pt-4">
          <span className="min-w-0 truncate text-sm text-muted-foreground">
            {message.speaker}
          </span>

          {hasAudio && (
            // Sits above the card-wide link overlay so it stays clickable.
            <button
              type="button"
              onClick={() =>
                audio.play({
                  slug: message.slug,
                  title: message.title,
                  speaker: message.speaker,
                  src: message.audio!.url,
                  artwork: message.thumbnail,
                })
              }
              aria-label={
                isPlaying ? `Pause ${message.title}` : `Listen to ${message.title}`
              }
              className="relative z-10 flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-semibold text-foreground transition-colors hover:border-gold hover:bg-gold hover:text-ink"
            >
              {isPlaying ? (
                <Pause className="h-3.5 w-3.5 fill-current" />
              ) : (
                <Play className="h-3.5 w-3.5 fill-current" />
              )}
              {isPlaying ? "Playing" : "Listen"}
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
