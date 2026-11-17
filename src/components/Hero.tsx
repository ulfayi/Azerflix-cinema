"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Check, Play, Plus, Star } from "lucide-react";
import { getYouTubeFallbackThumbnail } from "@/lib/movies";
import type { Movie } from "@/types/movie";

interface HeroProps {
  movies: Movie[];
  isInWatchlist: (movieId: string) => boolean;
  onToggleWatchlist: (movie: Movie) => void;
  onWatchClick: (movie: Movie) => void;
}

export function Hero({
  movies,
  isInWatchlist,
  onToggleWatchlist,
  onWatchClick,
}: HeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const currentMovie = movies[activeIndex] ?? movies[0];
  const [imgSrc, setImgSrc] = useState(currentMovie?.thumbnail ?? "");

  useEffect(() => {
    if (currentMovie) {
      setImgSrc(currentMovie.thumbnail);
    }
  }, [currentMovie]);

  useEffect(() => {
    if (movies.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % movies.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [movies.length]);

  if (!currentMovie) return null;

  const saved = isInWatchlist(currentMovie.id);

  return (
    <section
      aria-label="Önə çıxarılan film"
      className="relative flex min-h-[72vh] w-full items-end overflow-hidden bg-black sm:min-h-[78vh] lg:min-h-[84vh]"
    >
      <div className="absolute inset-0">
        <Image
          src={imgSrc}
          alt={currentMovie.title}
          fill
          priority
          sizes="100vw"
          onError={() =>
            setImgSrc(getYouTubeFallbackThumbnail(currentMovie.youtubeId))
          }
          className="scale-[1.02] object-cover object-center transition-opacity duration-500"
        />
      </div>

      {/* Həm Dark, həm Light rejimdə mətni tam oxunaqlı saxlayan kinematoqrafik kölgə */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/40"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-transparent"
      />

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-4 pb-14 pt-28 sm:px-6 sm:pb-16 lg:px-10 lg:pb-20">
        <div className="max-w-xl">
          <p className="text-xs font-medium text-neutral-300 sm:text-sm">
            Müddət: {currentMovie.duration} • {currentMovie.year}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            <span className="inline-flex items-center gap-1 font-bold text-white">
              <Star
                className="h-4 w-4 fill-amber-400 text-amber-400"
                aria-hidden="true"
              />
              {currentMovie.rating.toFixed(1)}
            </span>
            <span className="text-neutral-300">
              {currentMovie.genres.join(" | ")}
            </span>
          </div>

          <h1 className="mt-2.5 font-display text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            {currentMovie.title}
          </h1>

          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-neutral-200 sm:mt-4 sm:text-base">
            {currentMovie.description}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onWatchClick(currentMovie)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-accent px-7 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-accent/30 transition-all hover:bg-accent-hover active:scale-[0.98] sm:h-12 sm:text-sm"
            >
              <Play className="h-4 w-4 fill-white" aria-hidden="true" />
              <span>İzlə</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleWatchlist(currentMovie)}
              aria-pressed={saved}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-full border px-6 text-xs font-bold uppercase tracking-wider backdrop-blur-md transition-all active:scale-[0.98] sm:h-12 sm:text-sm ${
                saved
                  ? "border-accent bg-accent text-white shadow-md shadow-accent/30 hover:bg-accent-hover"
                  : "border-white/30 bg-black/60 text-white hover:border-accent hover:bg-accent/90"
              }`}
            >
              {saved ? (
                <>
                  <Check className="h-4 w-4 text-white" aria-hidden="true" />
                  <span>Siyahımdadır</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>Siyahıya əlavə et</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Alt mərkəz slayd indikatorları */}
        {movies.length > 1 && (
          <div
            aria-label="Önə çıxarılan filmlər"
            className="mt-10 flex items-center justify-center gap-2"
          >
            {movies.map((m, idx) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`${m.title} filminə keç`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === activeIndex
                    ? "w-8 bg-accent"
                    : "w-5 bg-white/35 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
