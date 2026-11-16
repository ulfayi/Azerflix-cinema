"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  BookmarkCheck,
  BookmarkPlus,
  Calendar,
  Clock,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Star,
  X,
} from "lucide-react";
import { getYouTubeFallbackThumbnail } from "@/lib/movies";
import type { Movie } from "@/types/movie";

interface MovieDetailModalProps {
  movie: Movie | null;
  autoPlay?: boolean;
  onClose: () => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (movie: Movie) => void;
}

interface YTPlayerInstance {
  destroy: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  getIframe: () => HTMLIFrameElement;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement | string,
        options: {
          videoId: string;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: (event: { target: YTPlayerInstance }) => void;
            onStateChange?: (event: {
              data: number;
              target: YTPlayerInstance;
            }) => void;
          };
        }
      ) => YTPlayerInstance;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

function formatTime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "0:00";
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);

  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export function MovieDetailModal({
  movie,
  autoPlay = false,
  onClose,
  isInWatchlist,
  onToggleWatchlist,
}: MovieDetailModalProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [imgSrc, setImgSrc] = useState("");

  const playerWrapperRef = useRef<HTMLDivElement>(null);
  const ytContainerRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<YTPlayerInstance | null>(null);
  const isSeekingRef = useRef(false);
  const seekLockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!movie) return;
    setIsPlaying(autoPlay);
    setIsVideoPaused(false);
    setCurrentTime(0);
    setDuration(0);
    setImgSrc(movie.thumbnail);
  }, [movie, autoPlay]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // YouTube IFrame API (isSeekingRef istifadə edildiyi üçün pleyer sıfırlanmır)
  useEffect(() => {
    if (!movie || !isPlaying || !ytContainerRef.current) return;

    let cancelled = false;
    let timeInterval: ReturnType<typeof setInterval> | null = null;

    const initPlayer = () => {
      if (cancelled || !ytContainerRef.current || !window.YT?.Player) return;

      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch {
          // ignore
        }
        ytPlayerRef.current = null;
      }

      ytPlayerRef.current = new window.YT.Player(ytContainerRef.current, {
        videoId: movie.youtubeId,
        playerVars: {
          autoplay: 1,
          controls: 1,
          fs: 1,
          rel: 0,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            if (cancelled) return;
            const iframe = event.target.getIframe();
            iframe.setAttribute(
              "allow",
              "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            );
            iframe.setAttribute("allowfullscreen", "true");
            iframe.style.width = "100%";
            iframe.style.height = "100%";

            const total = event.target.getDuration();
            if (total > 0) setDuration(total);

            timeInterval = setInterval(() => {
              if (!ytPlayerRef.current || isSeekingRef.current) return;
              try {
                const curr = ytPlayerRef.current.getCurrentTime();
                const dur = ytPlayerRef.current.getDuration();
                if (Number.isFinite(curr)) setCurrentTime(curr);
                if (Number.isFinite(dur) && dur > 0) setDuration(dur);
              } catch {
                // ignore
              }
            }, 400);
          },
          onStateChange: (event) => {
            if (cancelled) return;
            setIsVideoPaused(event.data === 2);
            const dur = event.target.getDuration();
            if (dur > 0) setDuration(dur);
          },
        },
      });
    };

    if (window.YT?.Player) {
      initPlayer();
    } else {
      const existingScript = document.querySelector(
        'script[src="https://www.youtube.com/iframe_api"]'
      );
      const prevReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prevReady?.();
        initPlayer();
      };

      if (!existingScript) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }
    }

    return () => {
      cancelled = true;
      if (timeInterval) clearInterval(timeInterval);
      if (seekLockTimeoutRef.current) clearTimeout(seekLockTimeoutRef.current);
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch {
          // ignore
        }
        ytPlayerRef.current = null;
      }
    };
  }, [movie, isPlaying]);

  const exitFullscreenIfActive = useCallback(async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        // ignore
      }
    }
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const container = playerWrapperRef.current;
    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // ignore
    }
  }, []);

  const handleClose = useCallback(async () => {
    await exitFullscreenIfActive();
    onClose();
  }, [exitFullscreenIfActive, onClose]);

  useEffect(() => {
    if (!movie) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.fullscreenElement) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [movie, onClose]);

  const handleTogglePlayPause = () => {
    const player = ytPlayerRef.current;
    if (!player) return;
    if (isVideoPaused) {
      player.playVideo();
      setIsVideoPaused(false);
    } else {
      player.pauseVideo();
      setIsVideoPaused(true);
    }
  };

  const commitSeek = (targetSeconds: number) => {
    const clamped = Math.max(0, Math.min(duration || 0, targetSeconds));
    isSeekingRef.current = true;
    setCurrentTime(clamped);
    ytPlayerRef.current?.seekTo(clamped, true);

    if (seekLockTimeoutRef.current) {
      clearTimeout(seekLockTimeoutRef.current);
    }
    seekLockTimeoutRef.current = setTimeout(() => {
      isSeekingRef.current = false;
    }, 600);
  };

  const handleSkip = (deltaSeconds: number) => {
    commitSeek(currentTime + deltaSeconds);
  };

  if (!movie) return null;

  const progressPercent =
    duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="movie-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          void handleClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2.5 sm:p-6"
    >
      <div className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-border-subtle bg-background-secondary shadow-2xl shadow-black">
        <button
          type="button"
          onClick={() => void handleClose()}
          aria-label="Modalı bağla"
          className="absolute right-3 top-3 z-40 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/80 text-white transition-colors hover:border-accent hover:bg-accent sm:right-3.5 sm:top-3.5 sm:h-10 sm:w-10"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Video pleyer və idarəetmə paneli */}
        <div
          ref={playerWrapperRef}
          className={`relative w-full bg-black ${
            isFullscreen ? "flex h-screen w-screen flex-col justify-between" : ""
          }`}
        >
          <div
            className={`relative w-full bg-black ${
              isFullscreen ? "flex-1" : "aspect-video"
            }`}
          >
            {isPlaying ? (
              <div ref={ytContainerRef} className="h-full w-full" />
            ) : (
              <>
                <Image
                  src={imgSrc || movie.thumbnail}
                  alt={movie.title}
                  fill
                  priority
                  sizes="(max-width: 896px) 100vw, 896px"
                  onError={() =>
                    setImgSrc(getYouTubeFallbackThumbnail(movie.youtubeId))
                  }
                  className="object-cover"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-background-secondary via-black/35 to-black/20"
                />
                <button
                  type="button"
                  onClick={() => setIsPlaying(true)}
                  aria-label={`${movie.title} filmini YouTube-da oynat`}
                  className="group absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent/90 text-white shadow-2xl shadow-accent/40 ring-4 ring-white/20 transition-all duration-200 hover:scale-110 hover:bg-accent sm:h-20 sm:w-20"
                >
                  <Play
                    className="ml-1 h-7 w-7 fill-white sm:h-8 sm:w-8"
                    aria-hidden="true"
                  />
                </button>
              </>
            )}
          </div>

          {isPlaying && (
            <div className="border-t border-white/10 bg-[#0f0f0f] px-3 py-2.5 sm:px-4">
              {/* Sürüşdürülən zaman xətti */}
              <div className="flex items-center gap-2.5 sm:gap-3">
                <span className="w-11 shrink-0 text-[11px] font-medium tabular-nums text-foreground-secondary sm:w-14 sm:text-xs">
                  {formatTime(currentTime)}
                </span>

                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={1}
                  value={currentTime}
                  onPointerDown={() => {
                    isSeekingRef.current = true;
                  }}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setCurrentTime(val);
                    if (!isSeekingRef.current) {
                      commitSeek(val);
                    }
                  }}
                  onPointerUp={(e) => {
                    commitSeek(Number((e.target as HTMLInputElement).value));
                  }}
                  onTouchEnd={(e) => {
                    commitSeek(Number((e.target as HTMLInputElement).value));
                  }}
                  aria-label="Videonun vaxtını dəyiş"
                  style={{
                    background: `linear-gradient(to right, #e50914 ${progressPercent}%, rgba(255,255,255,0.22) ${progressPercent}%)`,
                  }}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full accent-accent [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-md"
                />

                <span className="w-11 shrink-0 text-right text-[11px] font-medium tabular-nums text-foreground-secondary sm:w-14 sm:text-xs">
                  {formatTime(duration)}
                </span>
              </div>

              {/* İdarəetmə düymələri */}
              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={handleTogglePlayPause}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white/10 px-3 text-xs font-semibold text-white transition-colors hover:bg-white/20"
                  >
                    {isVideoPaused ? (
                      <>
                        <Play className="h-3.5 w-3.5 fill-white" aria-hidden="true" />
                        <span>Davam et</span>
                      </>
                    ) : (
                      <>
                        <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Fasilə</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSkip(-10)}
                    aria-label="10 saniyə geri"
                    className="inline-flex h-8 items-center gap-1 rounded-full bg-white/10 px-2.5 text-xs font-semibold text-foreground-secondary transition-colors hover:bg-white/20 hover:text-white sm:px-3"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>-10s</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSkip(10)}
                    aria-label="10 saniyə irəli"
                    className="inline-flex h-8 items-center gap-1 rounded-full bg-white/10 px-2.5 text-xs font-semibold text-foreground-secondary transition-colors hover:bg-white/20 hover:text-white sm:px-3"
                  >
                    <span>+10s</span>
                    <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => void toggleFullscreen()}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full bg-accent px-3.5 text-xs font-semibold text-white transition-colors hover:bg-accent-hover"
                >
                  {isFullscreen ? (
                    <>
                      <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Tam ekrandan çıx</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Tam ekran</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Film məlumatları */}
        <div className="p-4 sm:p-7">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-foreground-secondary sm:gap-2.5 sm:text-sm">
            <span className="inline-flex items-center gap-1 rounded-md bg-accent/20 px-2.5 py-1 font-semibold text-accent ring-1 ring-accent/40">
              <Star
                className="h-3.5 w-3.5 fill-accent text-accent"
                aria-hidden="true"
              />
              {movie.rating.toFixed(1)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 text-foreground">
              <Calendar
                className="h-3.5 w-3.5 text-foreground-secondary"
                aria-hidden="true"
              />
              {movie.year}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 text-foreground-secondary">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {movie.duration}
            </span>
          </div>

          <h2
            id="movie-modal-title"
            className="mt-3 font-display text-xl font-extrabold tracking-tight text-foreground sm:text-3xl"
          >
            {movie.title}
          </h2>

          <div className="mt-3 flex flex-wrap gap-2">
            {movie.genres.map((genre) => (
              <span
                key={genre}
                className="rounded-full border border-border-subtle bg-background-elevated px-3 py-1 text-xs font-medium text-foreground-secondary"
              >
                {genre}
              </span>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <button
              type="button"
              onClick={() => setIsPlaying((prev) => !prev)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:bg-accent-hover active:scale-[0.98]"
            >
              <Play className="h-4 w-4 fill-white" aria-hidden="true" />
              <span>{isPlaying ? "Posteri göstər" : "YouTube-da izlə"}</span>
            </button>

            {isPlaying && (
              <button
                type="button"
                onClick={() => void toggleFullscreen()}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/20 bg-background-elevated px-5 text-sm font-semibold text-foreground transition-colors hover:border-white/35 hover:bg-white/10"
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="h-4 w-4" aria-hidden="true" />
                    <span>Tam ekrandan çıx</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="h-4 w-4" aria-hidden="true" />
                    <span>Tam ekran</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => onToggleWatchlist(movie)}
              aria-pressed={isInWatchlist}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-full border px-5 text-sm font-semibold transition-all active:scale-[0.98] ${
                isInWatchlist
                  ? "border-accent/60 bg-accent/20 text-white hover:bg-accent/30"
                  : "border-white/20 bg-background-elevated text-foreground hover:border-white/35 hover:bg-white/10"
              }`}
            >
              {isInWatchlist ? (
                <>
                  <BookmarkCheck
                    className="h-4 w-4 text-accent"
                    aria-hidden="true"
                  />
                  <span>Siyahıdan çıxar</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="h-4 w-4" aria-hidden="true" />
                  <span>Siyahıya əlavə et</span>
                </>
              )}
            </button>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-foreground-secondary sm:text-base">
            {movie.description}
          </p>

          <div className="mt-6 grid gap-3 border-t border-border-subtle pt-5 text-sm sm:grid-cols-2">
            <div>
              <span className="block text-xs font-medium uppercase tracking-wider text-foreground-muted">
                Rejissor
              </span>
              <span className="mt-1 block font-medium text-foreground">
                {movie.director}
              </span>
            </div>
            <div>
              <span className="block text-xs font-medium uppercase tracking-wider text-foreground-muted">
                Rollarda
              </span>
              <span className="mt-1 block font-medium text-foreground">
                {movie.cast.join(", ")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
