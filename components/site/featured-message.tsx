"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { BookOpen, Clock, Download, Headphones, Play } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAudio } from "@/components/site/audio-provider";
import type { Message } from "@/lib/messages";
import { formatBytes, formatDate, formatDuration } from "@/lib/utils";

export function FeaturedMessage({ message }: { message: Message }) {
  const audio = useAudio();
  const playing = audio.isPlaying(message.slug);

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 24 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="group relative"
      >
        <Link
          href={`/messages/${message.slug}`}
          className="relative block aspect-video overflow-hidden rounded-3xl border border-border/60 bg-muted shadow-2xl"
        >
          <Image
            src={message.thumbnail}
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-ink/80 via-ink/25 to-transparent" />

          <motion.span
            whileHover={{ scale: 1.08 }}
            className="absolute left-1/2 top-1/2 flex h-[4.5rem] w-[4.5rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gold text-ink shadow-2xl animate-pulse-ring"
          >
            <Play className="ml-1 h-7 w-7 fill-current" />
          </motion.span>

          <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-2">
            <Badge className="border-none bg-ink/70 text-white backdrop-blur-sm hover:bg-ink/70">
              <Clock className="mr-1 h-3 w-3" />
              {formatDuration(message.durationSeconds)}
            </Badge>
            {message.video?.sizeBytes && (
              <Badge className="border-none bg-ink/70 text-white backdrop-blur-sm hover:bg-ink/70">
                {formatBytes(message.video.sizeBytes)} · streams on demand
              </Badge>
            )}
          </div>
        </Link>

        <span
          aria-hidden
          className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-gold/10 blur-3xl"
        />
      </motion.div>

      <div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gradient-gold">
            Latest message · {message.series}
          </p>

          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem]">
            {message.title}
          </h2>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{message.speaker}</span>
            <span aria-hidden>·</span>
            <time dateTime={message.date}>{formatDate(message.date)}</time>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-gold" />
              {message.scripture}
            </span>
          </div>

          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            {message.summary}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-gold font-semibold text-ink hover:bg-gold/90"
            >
              <Link href={`/messages/${message.slug}`}>
                <Play className="mr-2 h-4 w-4 fill-current" />
                Watch now
              </Link>
            </Button>

            {message.audio && (
              <Button
                size="lg"
                variant="outline"
                className="rounded-full font-semibold"
                onClick={() =>
                  audio.play({
                    slug: message.slug,
                    title: message.title,
                    speaker: message.speaker,
                    src: message.audio!.url,
                    artwork: message.thumbnail,
                  })
                }
              >
                <Headphones className="mr-2 h-4 w-4" />
                {playing ? "Pause audio" : "Listen instead"}
              </Button>
            )}

            {message.audio && (
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="rounded-full font-semibold text-muted-foreground"
              >
                <a
                  href={message.audio.downloadUrl ?? message.audio.url}
                  download
                >
                  <Download className="mr-2 h-4 w-4" />
                  MP3 · {formatBytes(message.audio.sizeBytes ?? 0)}
                </a>
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
