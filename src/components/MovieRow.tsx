"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MovieCard } from "@/components/MovieCard";
import type { Movie } from "@/types/movie";

interface MovieRowProps {
  title: string;
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  watchlistIds: string[];
  onToggleWatchlist: (movie: Movie) => void;
}

export function MovieRow({
  title,
  movies,
  onSelectMovie,
  watchlistIds,
  onToggleWatchlist,
}: MovieRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 8);
  }, []);

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener("resize", updateScrollButtons);
    return () => window.removeEventListener("resize", updateScrollButtons);
  }, [movies.length, updateScrollButtons]);

  const scrollByDirection = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    const offset = Math.round(el.clientWidth * 0.78);
    el.scrollBy({
      left: direction === "left" ? -offset : offset,
      behavior: "smooth",
    });
  };

  if (movies.length === 0) {
    return null;
  }

  return (
    <section aria-label={title} className="group/row relative py-4 sm:py-6">
      <div className="mx-auto mb-3 flex max-w-[1440px] items-baseline justify-between px-4 sm:mb-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="h-5 w-1 rounded-full bg-accent sm:h-6"
          />
          <h2 className="font-display text-lg font-bold tracking-tight text-foreground sm:text-xl lg:text-2xl">
            {title}
          </h2>
        </div>
        <span className="text-xs font-medium text-foreground-muted sm:text-sm">
          {movies.length} film
        </span>
      </div>

      <div className="relative mx-auto max-w-[1440px]">
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollByDirection("left")}
            aria-label={`${title} — sola sürüşdür`}
            className="absolute left-2 top-1/2 z-30 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/80 text-white shadow-xl backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-accent hover:bg-accent md:flex md:opacity-0 md:group-hover/row:opacity-100"
          >
            <ChevronLeft className="h-6 w-6" aria-hidden="true" />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={updateScrollButtons}
          className="flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-4 pb-4 pt-1 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-4 sm:px-6 lg:gap-5 lg:px-10 [&::-webkit-scrollbar]:hidden"
        >
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="w-[74vw] max-w-[300px] shrink-0 snap-start sm:w-[260px] md:w-[280px] lg:w-[295px]"
            >
              <MovieCard
                movie={movie}
                onSelect={onSelectMovie}
                isInWatchlist={watchlistIds.includes(movie.id)}
                onToggleWatchlist={onToggleWatchlist}
              />
            </div>
          ))}
        </div>

        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollByDirection("right")}
            aria-label={`${title} — sağa sürüşdür`}
            className="absolute right-2 top-1/2 z-30 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/80 text-white shadow-xl backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-accent hover:bg-accent md:flex md:opacity-0 md:group-hover/row:opacity-100"
          >
            <ChevronRight className="h-6 w-6" aria-hidden="true" />
          </button>
        )}
      </div>
    </section>
  );
}
