"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Film,
  Flame,
  Info,
  Plus,
  RotateCcw,
  Star,
  TrendingUp,
  X,
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { MovieCard } from "@/components/MovieCard";
import { MovieDetailModal } from "@/components/MovieDetailModal";
import { Navbar } from "@/components/Navbar";
import { useWatchlist } from "@/hooks/useWatchlist";
import {
  filterMovies,
  getAllGenres,
  getClassicMovies,
  getRandomMovie,
  getTrendingMovies,
  sortMovies,
} from "@/lib/movies";
import type { Movie } from "@/types/movie";

interface HomeClientProps {
  allMovies: Movie[];
  heroMovies: Movie[];
}

type CatalogTab = "trends" | "popular" | "classics" | "recent";

export function HomeClient({ allMovies, heroMovies }: HomeClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [activeTab, setActiveTab] = useState<CatalogTab>("trends");
  const [activeSection, setActiveSection] = useState<"home" | "movies">("home");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [autoPlayModal, setAutoPlayModal] = useState(false);
  const [recommendedMovie, setRecommendedMovie] = useState<Movie | null>(null);
  const [canScrollGenresLeft, setCanScrollGenresLeft] = useState(false);
  const [canScrollGenresRight, setCanScrollGenresRight] = useState(false);

  const genreScrollRef = useRef<HTMLDivElement>(null);
  const catalogRef = useRef<HTMLElement>(null);

  const { watchlistIds, isInWatchlist, toggleWatchlist } = useWatchlist();
  const genres = useMemo(() => getAllGenres(), []);

  const isSearching = searchQuery.trim().length > 0;

  const updateGenreArrows = useCallback(() => {
    const el = genreScrollRef.current;
    if (!el) return;
    setCanScrollGenresLeft(el.scrollLeft > 8);
    setCanScrollGenresRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    updateGenreArrows();
    window.addEventListener("resize", updateGenreArrows);
    return () => window.removeEventListener("resize", updateGenreArrows);
  }, [genres.length, updateGenreArrows]);

  const handleGenreClick = (genre: string) => {
    setSelectedGenre((prev) => (prev === genre ? "" : genre));
  };

  const handleSelectSection = (section: "home" | "movies") => {
    setActiveSection(section);
    if (section === "movies") {
      catalogRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePickRandom = () => {
    const picked = getRandomMovie(
      selectedGenre,
      recommendedMovie?.id,
      allMovies
    );
    if (picked) {
      setRecommendedMovie(picked);
      catalogRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const openMovieModal = (movie: Movie, autoPlay = false) => {
    setAutoPlayModal(autoPlay);
    setSelectedMovie(movie);
  };

  const displayedMovies = useMemo(() => {
    let baseList = allMovies;

    if (activeTab === "trends") {
      baseList = getTrendingMovies(allMovies);
    } else if (activeTab === "popular") {
      baseList = sortMovies(allMovies, "rating-desc");
    } else if (activeTab === "classics") {
      baseList = sortMovies(getClassicMovies(allMovies), "rating-desc");
    } else if (activeTab === "recent") {
      baseList = sortMovies(allMovies, "year-desc");
    }

    return filterMovies(baseList, searchQuery, selectedGenre);
  }, [allMovies, activeTab, searchQuery, selectedGenre]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedGenre("");
    setActiveTab("trends");
  };

  const tabs: { id: CatalogTab; label: string; icon: typeof TrendingUp }[] = [
    { id: "trends", label: "Trenddə olanlar", icon: TrendingUp },
    { id: "popular", label: "Populyar", icon: Flame },
    { id: "classics", label: "Klassiklər", icon: Star },
    { id: "recent", label: "Yeni əlavə edilənlər", icon: Plus },
  ];

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background">
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedGenre={selectedGenre}
        onGenreChange={setSelectedGenre}
        watchlistCount={watchlistIds.length}
        onPickRandom={handlePickRandom}
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
      />

      <main className="flex-1 pb-16">
        {!isSearching && (
          <Hero
            movies={heroMovies}
            isInWatchlist={isInWatchlist}
            onToggleWatchlist={toggleWatchlist}
            onWatchClick={(movie) => openMovieModal(movie, true)}
          />
        )}

        <section
          id="filmler"
          ref={catalogRef}
          aria-label="Filmlər kataloqu"
          className={`mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 ${
            isSearching ? "pt-24" : "pt-6"
          }`}
        >
          {/* Aktiv axtarış və ya janr məlumatı */}
          {(isSearching || selectedGenre) && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border-subtle bg-background-secondary px-4 py-2.5 text-xs sm:text-sm">
              <div className="flex flex-wrap items-center gap-2 text-foreground-secondary">
                {selectedGenre && (
                  <span>
                    Janr:{" "}
                    <strong className="text-foreground">{selectedGenre}</strong>
                  </span>
                )}
                {selectedGenre && isSearching && <span aria-hidden="true">•</span>}
                {isSearching && (
                  <span>
                    Axtarış:{" "}
                    <strong className="text-foreground">
                      &ldquo;{searchQuery.trim()}&rdquo;
                    </strong>
                  </span>
                )}
                <span className="text-foreground-muted">
                  ({displayedMovies.length} film)
                </span>
              </div>
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-accent-hover"
              >
                <RotateCcw className="h-3 w-3" aria-hidden="true" />
                <span>Sıfırla</span>
              </button>
            </div>
          )}

          {/* Tab Paneli */}
          <div className="flex items-center gap-5 overflow-x-auto border-b border-border-subtle pb-4 [-ms-overflow-style:none] [scrollbar-width:none] sm:justify-between sm:gap-6 [&::-webkit-scrollbar]:hidden">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex shrink-0 items-center gap-2 pb-2 text-xs font-bold transition-colors sm:gap-2.5 sm:text-base ${
                    isActive
                      ? "text-foreground"
                      : "text-foreground-secondary hover:text-foreground"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 sm:h-5 sm:w-5 ${
                      isActive ? "text-accent" : "text-foreground-muted"
                    }`}
                    aria-hidden="true"
                  />
                  <span>{tab.label}</span>
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-accent"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Sol/sağ oxlu Janr düymələri sırası */}
          <div className="relative mt-5 flex items-center gap-2 sm:mt-6">
            {canScrollGenresLeft && (
              <button
                type="button"
                onClick={() =>
                  genreScrollRef.current?.scrollBy({
                    left: -220,
                    behavior: "smooth",
                  })
                }
                aria-label="Janrları sola sürüşdür"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-white shadow-sm transition-colors hover:bg-accent-hover sm:h-9 sm:w-9"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
            )}

            <div
              ref={genreScrollRef}
              onScroll={updateGenreArrows}
              className="flex flex-1 items-center gap-2 overflow-x-auto py-1 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-2.5 [&::-webkit-scrollbar]:hidden"
            >
              <button
                type="button"
                onClick={() => setSelectedGenre("")}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all sm:px-5 sm:py-2 sm:text-sm ${
                  selectedGenre === ""
                    ? "bg-accent text-white shadow-md shadow-accent/30"
                    : "border border-border-subtle bg-background-elevated text-foreground-secondary hover:border-accent hover:text-foreground"
                }`}
              >
                Hamısı
              </button>

              {genres.map((genre) => {
                const isSelected = selectedGenre === genre;
                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => handleGenreClick(genre)}
                    aria-pressed={isSelected}
                    className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all sm:px-5 sm:py-2 sm:text-sm ${
                      isSelected
                        ? "bg-accent text-white shadow-md shadow-accent/30"
                        : "border border-border-subtle bg-background-elevated text-foreground-secondary hover:border-accent hover:text-foreground"
                    }`}
                  >
                    {genre}
                  </button>
                );
              })}
            </div>

            {canScrollGenresRight && (
              <button
                type="button"
                onClick={() =>
                  genreScrollRef.current?.scrollBy({
                    left: 220,
                    behavior: "smooth",
                  })
                }
                aria-label="Janrları sağa sürüşdür"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-white shadow-sm transition-colors hover:bg-accent-hover sm:h-9 sm:w-9"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* "Mənə film seç" tövsiyə kartı */}
          {recommendedMovie && (
            <div className="mt-5 flex flex-col gap-3 rounded-xl border border-accent/40 bg-background-secondary p-4 sm:flex-row sm:items-center sm:justify-between">
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
                  onClick={() => openMovieModal(recommendedMovie, false)}
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

          {/* Filmlər Grid-i */}
          {displayedMovies.length === 0 ? (
            <div className="mx-auto flex max-w-md flex-col items-center justify-center py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border-subtle bg-background-secondary text-foreground-muted">
                <Film className="h-8 w-8" aria-hidden="true" />
              </div>
              <h2 className="mt-5 font-display text-xl font-bold text-foreground">
                Uyğun film tapılmadı
              </h2>
              <p className="mt-2 text-sm text-foreground-secondary">
                Seçdiyiniz axtarış sorğusu və ya janr üzrə kataloqda film
                yoxdur.
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
            <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-7 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {displayedMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onSelect={(m) => openMovieModal(m, false)}
                  isInWatchlist={isInWatchlist(movie.id)}
                  onToggleWatchlist={toggleWatchlist}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />

      <MovieDetailModal
        movie={selectedMovie}
        autoPlay={autoPlayModal}
        onClose={() => setSelectedMovie(null)}
        isInWatchlist={selectedMovie ? isInWatchlist(selectedMovie.id) : false}
        onToggleWatchlist={toggleWatchlist}
      />
    </div>
  );
}
