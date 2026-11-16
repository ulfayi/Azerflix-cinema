"use client";

import { useState } from "react";
import { Info, Shuffle, Star, X } from "lucide-react";
import { getRandomMovie } from "@/lib/movies";
import type { Movie } from "@/types/movie";

interface RandomMoviePickerProps {
  allMovies: Movie[];
  selectedGenre: string;
  onSelectMovie: (movie: Movie) => void;
}

export function RandomMoviePicker({
  allMovies,
  selectedGenre,
  onSelectMovie,
}: RandomMoviePickerProps) {
  const [recommendedMovie, setRecommendedMovie] = useState<Movie | null>(null);

  const handlePickRandom = () => {
    const picked = getRandomMovie(
      selectedGenre,
      recommendedMovie?.id,
      allMovies
    );
    if (picked) {
      setRecommendedMovie(picked);
    }
  };

  return (
    <section
      aria-label="Təsadüfi film seçimi"
      className="mx-auto max-w-[1440px] px-4 pt-6 sm:px-6 lg:px-10"
    >
      <div className="rounded-2xl border border-border-subtle bg-background-secondary/90 p-4 shadow-lg sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-base font-bold text-foreground sm:text-lg">
              Nə izləyəcəyinizə qərar verə bilmirsiniz?
            </h2>
            <p className="mt-0.5 text-xs text-foreground-secondary sm:text-sm">
              {selectedGenre
                ? `Seçilmiş "${selectedGenre}" janrından təsadüfi film seçin.`
                : "Bütün Azərbaycan filmləri arasından təsadüfi tövsiyə alın."}
            </p>
          </div>

          <button
            type="button"
            onClick={handlePickRandom}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:bg-accent-hover active:scale-[0.98]"
          >
            <Shuffle className="h-4 w-4" aria-hidden="true" />
            <span>Mənə film seç</span>
          </button>
        </div>

        {recommendedMovie && (
          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-accent/30 bg-background-elevated/90 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <span className="inline-block text-[11px] font-semibold uppercase tracking-wider text-accent">
                Tövsiyə olunan film
              </span>
              <h3 className="mt-0.5 truncate font-display text-lg font-bold text-foreground sm:text-xl">
                {recommendedMovie.title}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-foreground-secondary">
                <span className="inline-flex items-center gap-1 font-semibold text-amber-400">
                  <Star
                    className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                    aria-hidden="true"
                  />
                  {recommendedMovie.rating.toFixed(1)}
                </span>
                <span aria-hidden="true">•</span>
                <span>{recommendedMovie.year}</span>
                <span aria-hidden="true">•</span>
                <span>{recommendedMovie.genres.join(", ")}</span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => onSelectMovie(recommendedMovie)}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-black transition-colors hover:bg-white/90 sm:flex-initial"
              >
                <Info className="h-4 w-4" aria-hidden="true" />
                <span>Ətraflı</span>
              </button>
              <button
                type="button"
                onClick={() => setRecommendedMovie(null)}
                aria-label="Tövsiyəni bağla"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border-subtle bg-background-secondary text-foreground-secondary transition-colors hover:border-white/25 hover:text-foreground"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
