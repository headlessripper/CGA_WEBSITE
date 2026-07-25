"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import {
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

import { cn, formatDuration } from "@/lib/utils";

export interface AudioTrack {
  slug: string;
  title: string;
  speaker: string;
  src: string;
  artwork: string;
}

interface AudioContextValue {
  track: AudioTrack | null;
  playing: boolean;
  current: number;
  duration: number;
  /** Start a track, or toggle it if it is already loaded. */
  play: (track: AudioTrack) => void;
  toggle: () => void;
  seek: (seconds: number) => void;
  seekBy: (delta: number) => void;
  close: () => void;
  /** True when this slug is the loaded track and it is playing. */
  isPlaying: (slug: string) => boolean;
  isLoaded: (slug: string) => boolean;
}

const AudioPlayerContext = createContext<AudioContextValue | null>(null);

export function useAudio() {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) throw new Error("useAudio must be used inside <AudioProvider>");
  return ctx;
}

/**
 * One <audio> element for the whole site, driven from context.
 *
 * Audio keeps playing while you browse which is the whole point for a church
 * podcast: people put a message on and then go read about a ministry.
 */
export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [track, setTrack] = useState<AudioTrack | null>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;

    const onTime = () => setCurrent(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);
    const onVolume = () => {
      setVolume(audio.volume);
      setMuted(audio.muted);
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("volumechange", onVolume);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("volumechange", onVolume);
    };
  }, []);

  const play = useCallback(
    (next: AudioTrack) => {
      const audio = audioRef.current;
      if (!audio) return;

      if (track?.slug === next.slug) {
        if (audio.paused) void audio.play();
        else audio.pause();
        return;
      }

      setTrack(next);
      setCurrent(0);
      setDuration(0);
      audio.src = next.src;
      void audio.play();
    },
    [track?.slug],
  );

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    if (audio.paused) void audio.play();
    else audio.pause();
  }, [track]);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = seconds;
    setCurrent(seconds);
  }, []);

  const seekBy = useCallback((delta: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(
      0,
      Math.min(audio.duration || 0, audio.currentTime + delta),
    );
  }, []);

  const close = useCallback(() => {
    audioRef.current?.pause();
    setTrack(null);
    setPlaying(false);
  }, []);

  // Lock-screen / hardware media keys.
  useEffect(() => {
    if (!track || typeof navigator === "undefined" || !("mediaSession" in navigator))
      return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.speaker,
      album: "Centre of Grace Assembly",
      artwork: [{ src: track.artwork, sizes: "512x512", type: "image/jpeg" }],
    });
    navigator.mediaSession.setActionHandler("play", () => toggle());
    navigator.mediaSession.setActionHandler("pause", () => toggle());
    navigator.mediaSession.setActionHandler("seekbackward", () => seekBy(-15));
    navigator.mediaSession.setActionHandler("seekforward", () => seekBy(15));
  }, [track, toggle, seekBy]);

  const value = useMemo<AudioContextValue>(
    () => ({
      track,
      playing,
      current,
      duration,
      play,
      toggle,
      seek,
      seekBy,
      close,
      isPlaying: (slug) => track?.slug === slug && playing,
      isLoaded: (slug) => track?.slug === slug,
    }),
    [track, playing, current, duration, play, toggle, seek, seekBy, close],
  );

  function changeVolume(v: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = v;
    audio.muted = v === 0;
  }

  function toggleMute() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
  }

  const progress = duration ? (current / duration) * 100 : 0;

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}

      <AnimatePresence>
        {track && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/85 backdrop-blur-2xl"
          >
            {/* Full-width progress line doubles as the scrubber. */}
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={1}
              value={current}
              onChange={(e) => seek(Number(e.target.value))}
              aria-label="Seek"
              className="absolute -top-1.5 left-0 h-1.5 w-full cursor-pointer appearance-none bg-transparent accent-gold [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:bg-border [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold"
              style={{
                background: `linear-gradient(to right, var(--gold) ${progress}%, var(--border) ${progress}%)`,
              }}
            />

            <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 lg:px-8">
              <Link
                href={`/messages/${track.slug}`}
                className="group flex min-w-0 flex-1 items-center gap-3"
              >
                <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={track.artwork}
                    alt=""
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                    {track.title}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {track.speaker}
                  </span>
                </span>
              </Link>

              <Equalizer active={playing} />

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => seekBy(-15)}
                  aria-label="Back 15 seconds"
                  className="hidden h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:flex"
                >
                  <RotateCcw className="h-[18px] w-[18px]" />
                </button>

                <motion.button
                  type="button"
                  onClick={toggle}
                  whileTap={{ scale: 0.9 }}
                  aria-label={playing ? "Pause" : "Play"}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-gold text-ink shadow-lg"
                >
                  {playing ? (
                    <Pause className="h-5 w-5 fill-current" />
                  ) : (
                    <Play className="ml-0.5 h-5 w-5 fill-current" />
                  )}
                </motion.button>

                <button
                  type="button"
                  onClick={() => seekBy(15)}
                  aria-label="Forward 15 seconds"
                  className="hidden h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:flex"
                >
                  <RotateCw className="h-[18px] w-[18px]" />
                </button>
              </div>

              <span className="hidden w-28 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground md:block">
                {formatDuration(current)} / {formatDuration(duration)}
              </span>

              <div className="hidden items-center gap-2 lg:flex">
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={muted ? "Unmute" : "Mute"}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {muted || volume === 0 ? (
                    <VolumeX className="h-[18px] w-[18px]" />
                  ) : (
                    <Volume2 className="h-[18px] w-[18px]" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={muted ? 0 : volume}
                  onChange={(e) => changeVolume(Number(e.target.value))}
                  aria-label="Volume"
                  className="h-1 w-20 cursor-pointer accent-gold"
                />
              </div>

              <button
                type="button"
                onClick={close}
                aria-label="Close player"
                className="ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <X className="h-[18px] w-[18px]" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AudioPlayerContext.Provider>
  );
}

/** Decorative level meter mirrors play state, not the actual waveform. */
export function Equalizer({
  active,
  className,
  bars = 4,
}: {
  active: boolean;
  className?: string;
  bars?: number;
}) {
  return (
    <span
      aria-hidden
      className={cn("hidden items-end gap-[3px] px-2 sm:flex", className)}
    >
      {Array.from({ length: bars }).map((_, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-gold"
          animate={
            active
              ? { height: [6, 18, 9, 22, 6] }
              : { height: 5 }
          }
          transition={
            active
              ? {
                  duration: 1.1 + i * 0.18,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
              : { duration: 0.3 }
          }
          style={{ height: 5 }}
        />
      ))}
    </span>
  );
}
