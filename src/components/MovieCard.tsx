"use client";

import { memo, useEffect, useState, type MouseEvent } from "react";
import Image from "next/image";
import { BookmarkCheck, BookmarkPlus, Info, Star } from "lucide-react";
import { getYouTubeFallbackThumbnail } from "@/lib/movies";
import type { Movie } from "@/types/movie";

interface MovieCardProps {
  movie: Movie;
  onSelect: (movie: Movie) => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (movie: Movie) => void;
}

export const MovieCard = memo(function MovieCard({
  movie,
  onSelect,
  isInWatchlist,
  onToggleWatchlist,
}: MovieCardProps) {
  const [imgSrc, setImgSrc] = useState(movie.thumbnail);

  useEffect(() => {
    setImgSrc(movie.thumbnail);
  }, [movie.thumbnail]);

  const handleWatchlistClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onToggleWatchlist(movie);
  };

  return (
    <article className="group relative overflow-hidden rounded-xl border border-border-subtle bg-background-secondary transition-all duration-300 ease-out hover:z-10 hover:scale-[1.03] hover:border-white/25 hover:shadow-2xl hover:shadow-black/90">
      <button
        type="button"
        onClick={handleWatchlistClick}
        aria-pressed={isInWatchlist}
        aria-label={isInWatchlist ? "Siyahıdan çıxar" : "Siyahıya əlavə et"}
        title={isInWatchlist ? "Siyahıdan çıxar" : "Siyahıya əlavə et"}
        className={`absolute right-2.5 top-2.5 z-20 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-200 ${
          isInWatchlist
            ? "border-accent bg-accent text-white shadow-md shadow-accent/30 hover:bg-accent-hover"
            : "border-white/20 bg-black/65 text-white/90 hover:border-white/40 hover:bg-black/85"
        }`}
      >
        {isInWatchlist ? (
          <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
        ) : (
          <BookmarkPlus className="h-4 w-4" aria-hidden="true" />
        )}
      </button>

      <button
        type="button"
        onClick={() => onSelect(movie)}
        className="block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <div className="relative aspect-video w-full overflow-hidden bg-background-elevated">
          <Image
            src={imgSrc}
            alt={movie.title}
            fill
            sizes="(max-width: 640px) 74vw, (max-width: 1024px) 280px, 300px"
            onError={() =>
              setImgSrc(getYouTubeFallbackThumbnail(movie.youtubeId))
            }
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />

          <div className="absolute inset-0 flex items-end justify-start bg-gradient-to-t from-black/90 via-black/35 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-accent/30">
              <Info className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Ətraflı</span>
            </span>
          </div>
        </div>

        <div className="p-3.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 font-display text-sm font-semibold text-foreground transition-colors group-hover:text-white sm:text-base">
              {movie.title}
            </h3>
            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-amber-400">
              <Star
                className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                aria-hidden="true"
              />
              {movie.rating.toFixed(1)}
            </span>
          </div>

          <div className="mt-1.5 flex items-center gap-2 text-xs text-foreground-secondary">
            <span className="shrink-0 font-medium text-foreground/80">
              {movie.year}
            </span>
            <span aria-hidden="true" className="text-foreground-muted">
              •
            </span>
            <span className="line-clamp-1">
              {movie.genres.slice(0, 2).join(", ")}
            </span>
          </div>
        </div>
      </button>
    </article>
  );
});
