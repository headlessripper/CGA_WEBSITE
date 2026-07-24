"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Loader2,
  Maximize,
  Minimize,
  Pause,
  PictureInPicture2,
  Play,
  RotateCcw,
  RotateCw,
  Settings,
  Volume2,
  VolumeX,
} from "lucide-react";

import { cn, formatDuration } from "@/lib/utils";

interface QualityLevel {
  index: number;
  height: number;
  bitrate: number;
}

interface VideoPlayerProps {
  /** Adaptive HLS manifest. */
  src: string;
  poster?: string;
  title?: string;
  className?: string;
}

const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2];

/**
 * HLS video player.
 *
 * Adaptive streaming is what makes multi-gigabyte service recordings viable:
 * hls.js requests only the segments needed at the bitrate the connection can
 * sustain, so nobody downloads a 9 GB file to watch ten minutes.
 */
export function VideoPlayer({ src, poster, title, className }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [levels, setLevels] = useState<QualityLevel[]>([]);
  const [activeLevel, setActiveLevel] = useState(-1); // -1 === auto
  const [error, setError] = useState<string | null>(null);

  const setLevelRef = useRef<((index: number) => void) | null>(null);

  /* ---------------------------------------------------------------- setup */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let destroyed = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let hls: any = null;

    const isHls = src.includes(".m3u8");
    const nativeHls = video.canPlayType("application/vnd.apple.mpegurl") !== "";

    async function attach() {
      if (!video) return;

      if (!isHls || nativeHls) {
        // Safari and iOS play HLS natively; MP4 sources need no library.
        video.src = src;
        return;
      }

      const Hls = (await import("hls.js")).default;
      if (destroyed) return;

      if (!Hls.isSupported()) {
        setError("This browser cannot play the stream. Try the download link.");
        return;
      }

      hls = new Hls({
        // Keep memory sane on long services without starving the buffer.
        maxBufferLength: 30,
        maxMaxBufferLength: 90,
        backBufferLength: 30,
        enableWorker: true,
        lowLatencyMode: false,
      });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (destroyed) return;
        setLevels(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          hls.levels.map((l: any, index: number) => ({
            index,
            height: l.height,
            bitrate: l.bitrate,
          })),
        );
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_e: unknown, data: { level: number }) => {
        if (!destroyed && hls.autoLevelEnabled === false) {
          setActiveLevel(data.level);
        }
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      hls.on(Hls.Events.ERROR, (_e: unknown, data: any) => {
        if (!data?.fatal) return;
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          setError("The stream could not be loaded.");
          hls.destroy();
        }
      });

      hls.loadSource(src);
      hls.attachMedia(video);

      setLevelRef.current = (index: number) => {
        hls.currentLevel = index;
        setActiveLevel(index);
      };
    }

    attach();

    return () => {
      destroyed = true;
      setLevelRef.current = null;
      hls?.destroy();
    };
  }, [src]);

  /* ------------------------------------------------------------- listeners */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTime = () => {
      setCurrent(video.currentTime);
      if (video.buffered.length) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };
    const onMeta = () => {
      setDuration(video.duration);
      setReady(true);
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onWaiting = () => setWaiting(true);
    const onPlaying = () => setWaiting(false);
    const onVolume = () => {
      setVolume(video.volume);
      setMuted(video.muted);
    };

    video.addEventListener("timeupdate", onTime);
    video.addEventListener("progress", onTime);
    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("volumechange", onVolume);

    return () => {
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("progress", onTime);
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("volumechange", onVolume);
    };
  }, []);

  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  /* --------------------------------------------------------------- actions */
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play();
    else video.pause();
  }, []);

  const seekBy = useCallback((delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(
      0,
      Math.min(video.duration || 0, video.currentTime + delta),
    );
  }, []);

  const seekTo = useCallback((fraction: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    video.currentTime = fraction * video.duration;
  }, []);

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  }

  function changeVolume(value: number) {
    const video = videoRef.current;
    if (!video) return;
    video.volume = value;
    video.muted = value === 0;
  }

  function changeSpeed(value: number) {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = value;
    setSpeed(value);
  }

  async function toggleFullscreen() {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await containerRef.current?.requestFullscreen();
  }

  async function togglePip() {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch {
      // PiP is unavailable in some browsers; failing quietly is correct here.
    }
  }

  /* ------------------------------------------------------ keyboard support */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const container = containerRef.current;
      if (!container?.contains(document.activeElement) && !fullscreen) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          seekBy(-10);
          break;
        case "ArrowRight":
          e.preventDefault();
          seekBy(10);
          break;
        case "f":
          void toggleFullscreen();
          break;
        case "m":
          toggleMute();
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen, seekBy, togglePlay]);

  /* --------------------------------------------------- auto-hiding controls */
  const nudgeControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused && !settingsOpen) {
        setControlsVisible(false);
      }
    }, 2800);
  }, [settingsOpen]);

  useEffect(() => {
    if (!playing) setControlsVisible(true);
  }, [playing]);

  useEffect(
    () => () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    },
    [],
  );

  const progress = duration ? (current / duration) * 100 : 0;
  const bufferedPct = duration ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={nudgeControls}
      onMouseLeave={() => playing && setControlsVisible(false)}
      tabIndex={0}
      className={cn(
        "group relative aspect-video w-full overflow-hidden rounded-2xl bg-ink outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        !controlsVisible && playing && "cursor-none",
        className,
      )}
    >
      <video
        ref={videoRef}
        poster={poster}
        playsInline
        preload="metadata"
        onClick={togglePlay}
        className="h-full w-full bg-ink object-contain"
        aria-label={title}
      />

      {/* Buffering spinner */}
      <AnimatePresence>
        {(waiting || !ready) && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 grid place-items-center"
          >
            <Loader2 className="h-10 w-10 animate-spin text-gold" />
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="absolute inset-0 grid place-items-center bg-ink/85 p-6 text-center">
          <p className="max-w-sm text-sm text-white/80">{error}</p>
        </div>
      )}

      {/* Big centre play button before first playback */}
      <AnimatePresence>
        {!playing && !error && (
          <motion.button
            type="button"
            onClick={togglePlay}
            aria-label="Play message"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.25 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className="absolute left-1/2 top-1/2 z-10 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gold/95 text-ink shadow-2xl animate-pulse-ring"
          >
            <Play className="ml-1 h-8 w-8 fill-current" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Controls */}
      <AnimatePresence>
        {controlsVisible && !error && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-ink via-ink/70 to-transparent px-3 pb-3 pt-16 sm:px-4 sm:pb-4"
          >
            {/* Scrub bar */}
            <Scrubber
              progress={progress}
              buffered={bufferedPct}
              duration={duration}
              onSeek={seekTo}
            />

            <div className="mt-2.5 flex items-center gap-1 text-white sm:gap-2">
              <IconButton onClick={togglePlay} label={playing ? "Pause" : "Play"}>
                {playing ? (
                  <Pause className="h-5 w-5 fill-current" />
                ) : (
                  <Play className="h-5 w-5 fill-current" />
                )}
              </IconButton>

              <IconButton onClick={() => seekBy(-10)} label="Back 10 seconds">
                <RotateCcw className="h-[18px] w-[18px]" />
              </IconButton>
              <IconButton onClick={() => seekBy(10)} label="Forward 10 seconds">
                <RotateCw className="h-[18px] w-[18px]" />
              </IconButton>

              <div className="group/vol flex items-center gap-1.5">
                <IconButton onClick={toggleMute} label={muted ? "Unmute" : "Mute"}>
                  {muted || volume === 0 ? (
                    <VolumeX className="h-[18px] w-[18px]" />
                  ) : (
                    <Volume2 className="h-[18px] w-[18px]" />
                  )}
                </IconButton>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={muted ? 0 : volume}
                  onChange={(e) => changeVolume(Number(e.target.value))}
                  aria-label="Volume"
                  className="h-1 w-0 cursor-pointer appearance-none rounded-full bg-white/30 opacity-0 transition-all duration-300 accent-gold group-hover/vol:w-20 group-hover/vol:opacity-100 sm:w-16 sm:opacity-100"
                />
              </div>

              <span className="ml-1 select-none font-mono text-xs tabular-nums text-white/85 sm:text-sm">
                {formatDuration(current)}
                <span className="text-white/40"> / {formatDuration(duration)}</span>
              </span>

              <div className="ml-auto flex items-center gap-1 sm:gap-2">
                <div className="relative">
                  <IconButton
                    onClick={() => setSettingsOpen((v) => !v)}
                    label="Playback settings"
                    active={settingsOpen}
                  >
                    <Settings className="h-[18px] w-[18px]" />
                  </IconButton>

                  <AnimatePresence>
                    {settingsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.18 }}
                        className="absolute bottom-12 right-0 w-52 overflow-hidden rounded-xl border border-white/10 bg-ink/95 p-2 shadow-2xl backdrop-blur-xl"
                      >
                        <p className="px-2 pb-1 pt-1.5 text-[0.65rem] font-semibold uppercase tracking-widest text-white/40">
                          Speed
                        </p>
                        <div className="grid grid-cols-3 gap-1">
                          {SPEEDS.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => changeSpeed(s)}
                              className={cn(
                                "rounded-md py-1.5 text-xs font-medium transition-colors",
                                speed === s
                                  ? "bg-gold text-ink"
                                  : "text-white/70 hover:bg-white/10",
                              )}
                            >
                              {s}×
                            </button>
                          ))}
                        </div>

                        {levels.length > 0 && (
                          <>
                            <p className="px-2 pb-1 pt-3 text-[0.65rem] font-semibold uppercase tracking-widest text-white/40">
                              Quality
                            </p>
                            <div className="max-h-40 space-y-0.5 overflow-y-auto">
                              <QualityRow
                                label="Auto"
                                hint="Adapts to your connection"
                                selected={activeLevel === -1}
                                onClick={() => setLevelRef.current?.(-1)}
                              />
                              {levels
                                .slice()
                                .sort((a, b) => b.height - a.height)
                                .map((l) => (
                                  <QualityRow
                                    key={l.index}
                                    label={`${l.height}p`}
                                    hint={`${Math.round(l.bitrate / 1000)} kbps`}
                                    selected={activeLevel === l.index}
                                    onClick={() => setLevelRef.current?.(l.index)}
                                  />
                                ))}
                            </div>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <IconButton
                  onClick={togglePip}
                  label="Picture in picture"
                  className="hidden sm:flex"
                >
                  <PictureInPicture2 className="h-[18px] w-[18px]" />
                </IconButton>

                <IconButton
                  onClick={toggleFullscreen}
                  label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
                >
                  {fullscreen ? (
                    <Minimize className="h-[18px] w-[18px]" />
                  ) : (
                    <Maximize className="h-[18px] w-[18px]" />
                  )}
                </IconButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function Scrubber({
  progress,
  buffered,
  duration,
  onSeek,
}: {
  progress: number;
  buffered: number;
  duration: number;
  onSeek: (fraction: number) => void;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const [hoverPct, setHoverPct] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);

  const fractionFromEvent = useCallback((clientX: number) => {
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => onSeek(fractionFromEvent(e.clientX));
    const up = () => setDragging(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [dragging, fractionFromEvent, onSeek]);

  return (
    <div
      ref={barRef}
      role="slider"
      tabIndex={0}
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      onPointerDown={(e) => {
        setDragging(true);
        onSeek(fractionFromEvent(e.clientX));
      }}
      onMouseMove={(e) => setHoverPct(fractionFromEvent(e.clientX) * 100)}
      onMouseLeave={() => setHoverPct(null)}
      className="group/bar relative h-6 cursor-pointer touch-none"
    >
      <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-white/20 transition-all duration-200 group-hover/bar:h-1.5">
        <div
          className="absolute inset-y-0 left-0 bg-white/25"
          style={{ width: `${buffered}%` }}
        />
        <div
          className="absolute inset-y-0 left-0 bg-gold"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div
        className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-gold shadow-lg transition-transform duration-200 group-hover/bar:scale-100"
        style={{ left: `${progress}%` }}
      />

      {hoverPct !== null && duration > 0 && (
        <div
          className="pointer-events-none absolute -top-7 -translate-x-1/2 rounded-md bg-ink px-1.5 py-0.5 font-mono text-[0.65rem] text-white shadow-lg"
          style={{ left: `${hoverPct}%` }}
        >
          {formatDuration((hoverPct / 100) * duration)}
        </div>
      )}
    </div>
  );
}

function IconButton({
  children,
  onClick,
  label,
  active,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  active?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full text-white/90 transition-all hover:bg-white/15 hover:text-white active:scale-90",
        active && "bg-white/15 text-white",
        className,
      )}
    >
      {children}
    </button>
  );
}

function QualityRow({
  label,
  hint,
  selected,
  onClick,
}: {
  label: string;
  hint: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors",
        selected ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10",
      )}
    >
      <span className="font-medium">{label}</span>
      <span className="text-[0.65rem] text-white/40">{hint}</span>
    </button>
  );
}
