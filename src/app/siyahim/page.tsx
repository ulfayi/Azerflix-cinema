"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bookmark, Film, Info, RotateCcw, X } from "lucide-react";
import { Footer } from "@/components/Footer";
import { MovieCard } from "@/components/MovieCard";
import { MovieDetailModal } from "@/components/MovieDetailModal";
import { Navbar } from "@/components/Navbar";
import { useWatchlist } from "@/hooks/useWatchlist";
import { filterMovies, getAllMovies, getRandomMovie } from "@/lib/movies";
import type { Movie } from "@/types/movie";

export default function WatchlistPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [recommendedMovie, setRecommendedMovie] = useState<Movie | null>(null);

  const allMovies = useMemo(() => getAllMovies(), []);

  const {
    watchlistIds,
    watchlistMovies,
    isLoaded,
    isInWatchlist,
    toggleWatchlist,
  } = useWatchlist();

  const filteredWatchlist = useMemo(
    () => filterMovies(watchlistMovies, searchQuery, selectedGenre),
    [watchlistMovies, searchQuery, selectedGenre]
  );

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

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedGenre("");
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background">
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedGenre={selectedGenre}
        onGenreChange={setSelectedGenre}
        watchlistCount={watchlistIds.length}
        onPickRandom={handlePickRandom}
      />

      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 pb-16 pt-24 sm:px-6 lg:px-10">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="h-7 w-1 rounded-full bg-accent" aria-hidden="true" />
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Mənim siyahım
          </h1>
          {isLoaded && (
            <span className="rounded-full bg-background-elevated px-3 py-1 text-xs font-semibold text-foreground-secondary">
              {watchlistMovies.length} film
            </span>
          )}
        </div>

        {/* "Mənə film seç" tövsiyə kartı */}
        {recommendedMovie && (
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-accent/40 bg-background-secondary p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-accent">
                Təsadüfi tövsiyə
              </span>
              <h3 className="mt-0.5 truncate font-display text-lg font-bold text-foreground">
                {recommendedMovie.title}
              </h3>
              <p className="text-xs text-foreground-secondary">
                {recommendedMovie.year} • {recommendedMovie.genres.join(", ")}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedMovie(recommendedMovie)}
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-accent px-4 text-xs font-bold text-white shadow-sm hover:bg-accent-hover"
              >
                <Info className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Ətraflı</span>
              </button>
              <button
                type="button"
                onClick={() => setRecommendedMovie(null)}
                aria-label="Tövsiyəni bağla"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle text-foreground-secondary hover:border-accent hover:text-accent"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {!isLoaded ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="aspect-video animate-pulse rounded-xl bg-background-secondary"
              />
            ))}
          </div>
        ) : watchlistMovies.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border-subtle bg-background-secondary text-foreground-muted">
              <Bookmark className="h-8 w-8" aria-hidden="true" />
            </div>
            <h2 className="mt-5 font-display text-xl font-bold text-foreground">
              Siyahınız hələ boşdur
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground-secondary">
              Film kartlarının sağ üst küncündəki işarəyə və ya film pəncərəsindəki{" "}
              <strong className="text-foreground">&ldquo;Siyahıya əlavə et&rdquo;</strong>{" "}
              düyməsinə klikləyərək filmləri bu brauzerdə yadda saxlaya bilərsiniz.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
            >
              Filmlərə bax
            </Link>
          </div>
        ) : filteredWatchlist.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border-subtle bg-background-secondary text-foreground-muted">
              <Film className="h-8 w-8" aria-hidden="true" />
            </div>
            <h2 className="mt-5 font-display text-xl font-bold text-foreground">
              Uyğun film tapılmadı
            </h2>
            <p className="mt-2 text-sm text-foreground-secondary">
              Siyahınızdakı filmlər arasında bu axtarış və ya janra uyğun nəticə yoxdur.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>Filtrləri sıfırla</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredWatchlist.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onSelect={setSelectedMovie}
                isInWatchlist={isInWatchlist(movie.id)}
                onToggleWatchlist={toggleWatchlist}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />

      <MovieDetailModal
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
        isInWatchlist={selectedMovie ? isInWatchlist(selectedMovie.id) : false}
        onToggleWatchlist={toggleWatchlist}
      />
    </div>
  );
}
