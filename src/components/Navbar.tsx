"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, Search, Shuffle, X } from "lucide-react";
import { getAllGenres } from "@/lib/movies";

interface NavbarProps {
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  selectedGenre?: string;
  onGenreChange?: (value: string) => void;
  watchlistCount?: number;
  onPickRandom?: () => void;
  activeSection?: "home" | "movies";
  onSelectSection?: (section: "home" | "movies") => void;
}

export function Navbar({
  searchQuery = "",
  onSearchChange,
  selectedGenre = "",
  onGenreChange,
  watchlistCount = 0,
  onPickRandom,
  activeSection = "home",
  onSelectSection,
}: NavbarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const genres = useMemo(() => getAllGenres(), []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isWatchlistPage = pathname === "/siyahim";
  const isHomeActive = !isWatchlistPage && activeSection === "home";
  const isMoviesActive = !isWatchlistPage && activeSection === "movies";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? "border-b border-border-subtle bg-background/95 backdrop-blur-md"
          : "bg-gradient-to-b from-black/85 via-black/45 to-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
        {/* Sol: Loqo */}
        <Link
          href="/"
          onClick={() => onSelectSection?.("home")}
          className="group flex min-w-0 shrink-0 items-center gap-2 focus:outline-none"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="shrink-0 transition-transform duration-200 group-hover:scale-105"
          >
            <rect width="28" height="28" rx="6" fill="#E50914" />
            <path d="M10.5 8.25L20 14L10.5 19.75V8.25Z" fill="#FFFFFF" />
          </svg>
          <span className="truncate font-display text-base font-extrabold tracking-tight sm:text-xl">
            <span className="text-accent">Azerflix</span>{" "}
            <span className="text-foreground">Azərbaycan</span>
          </span>
        </Link>

        {/* Orta: Naviqasiya linkləri + Janr scroll seçimi */}
        <nav
          aria-label="Əsas naviqasiya"
          className="hidden items-center gap-5 lg:gap-7 md:flex"
        >
          <Link
            href="/"
            onClick={() => onSelectSection?.("home")}
            className={`relative shrink-0 py-2 text-sm font-medium transition-colors ${
              isHomeActive
                ? "text-white"
                : "text-foreground-secondary hover:text-white"
            }`}
          >
            Ana səhifə
            {isHomeActive && (
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-accent"
              />
            )}
          </Link>

          {onSelectSection ? (
            <button
              type="button"
              onClick={() => onSelectSection("movies")}
              className={`relative shrink-0 py-2 text-sm font-medium transition-colors ${
                isMoviesActive
                  ? "text-white"
                  : "text-foreground-secondary hover:text-white"
              }`}
            >
              Filmlər
              {isMoviesActive && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-accent"
                />
              )}
            </button>
          ) : (
            <Link
              href="/#filmler"
              className="relative shrink-0 py-2 text-sm font-medium text-foreground-secondary transition-colors hover:text-white"
            >
              Filmlər
            </Link>
          )}

          {/* Filmlərdən sağda Janr seçimi (scroll olunan dropdown) */}
          {onGenreChange && (
            <div className="relative shrink-0">
              <select
                aria-label="Janr seçimi"
                value={selectedGenre}
                onChange={(e) => onGenreChange(e.target.value)}
                className="h-9 max-w-[160px] cursor-pointer appearance-none rounded-full border border-white/15 bg-black/50 pl-3.5 pr-8 text-xs font-medium text-foreground-secondary backdrop-blur-md transition-colors hover:border-white/35 hover:text-white focus:border-accent focus:outline-none"
              >
                <option value="">Bütün janrlar</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground-secondary"
                aria-hidden="true"
              />
            </div>
          )}

          <Link
            href="/siyahim"
            className={`relative inline-flex shrink-0 items-center gap-1.5 py-2 text-sm font-medium transition-colors ${
              isWatchlistPage
                ? "text-white"
                : "text-foreground-secondary hover:text-white"
            }`}
          >
            <span>Mənim siyahım</span>
            {watchlistCount > 0 && (
              <span className="rounded-full bg-accent px-1.5 py-0.5 text-[11px] font-bold leading-none text-white">
                {watchlistCount}
              </span>
            )}
            {isWatchlistPage && (
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-accent"
              />
            )}
          </Link>
        </nav>

        {/* Sağ: Axtarış və "Mənə film seç" */}
        <div className="hidden items-center gap-2.5 md:flex">
          {onSearchChange && (
            <div className="relative flex items-center">
              {isSearchOpen || searchQuery ? (
                <div className="relative w-48 lg:w-60">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Film adı yazın..."
                    aria-label="Film axtar"
                    autoFocus={isSearchOpen}
                    className="h-9 w-full rounded-full border border-white/20 bg-black/75 pl-9 pr-8 text-sm text-foreground placeholder:text-foreground-muted backdrop-blur-md focus:border-accent focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      onSearchChange("");
                      setIsSearchOpen(false);
                    }}
                    aria-label="Axtarışı bağla"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-white"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  aria-label="Axtarışı aç"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-foreground-secondary transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Search className="h-5 w-5" aria-hidden="true" />
                </button>
              )}
            </div>
          )}

          {onPickRandom && (
            <button
              type="button"
              onClick={onPickRandom}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 text-xs font-semibold text-white backdrop-blur-md transition-all hover:border-accent hover:bg-accent"
            >
              <Shuffle className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Mənə film seç</span>
            </button>
          )}
        </div>

        {/* Mobil: Axtarış və Hamburger */}
        <div className="flex shrink-0 items-center gap-2 md:hidden">
          {onSearchChange && (
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Axtar"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle bg-black/60 text-foreground"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? "Menyunu bağla" : "Menyunu aç"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle bg-black/60 text-foreground"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobil açılan menyu */}
      {isMobileMenuOpen && (
        <div className="border-t border-border-subtle bg-background-secondary/95 px-4 pb-5 pt-4 backdrop-blur-md md:hidden">
          <div className="flex flex-col gap-3">
            {onSearchChange && (
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Film adı yazın..."
                  aria-label="Film axtar"
                  className="h-10 w-full rounded-lg border border-border-subtle bg-background-elevated pl-10 pr-9 text-sm text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => onSearchChange("")}
                    aria-label="Axtarışı təmizlə"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            )}

            {onGenreChange && (
              <div className="relative">
                <select
                  aria-label="Janr seçimi"
                  value={selectedGenre}
                  onChange={(e) => {
                    onGenreChange(e.target.value);
                    setIsMobileMenuOpen(false);
                  }}
                  className="h-10 w-full cursor-pointer appearance-none rounded-lg border border-border-subtle bg-background-elevated pl-3.5 pr-9 text-sm font-medium text-foreground focus:border-accent focus:outline-none"
                >
                  <option value="">Bütün janrlar</option>
                  {genres.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-secondary"
                  aria-hidden="true"
                />
              </div>
            )}

            <div className="flex flex-col gap-1">
              <Link
                href="/"
                onClick={() => {
                  onSelectSection?.("home");
                  setIsMobileMenuOpen(false);
                }}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  isHomeActive
                    ? "bg-accent/15 text-accent"
                    : "text-foreground hover:bg-white/5"
                }`}
              >
                Ana səhifə
              </Link>

              {onSelectSection ? (
                <button
                  type="button"
                  onClick={() => {
                    onSelectSection("movies");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`rounded-lg px-3 py-2 text-left text-sm font-medium ${
                    isMoviesActive
                      ? "bg-accent/15 text-accent"
                      : "text-foreground hover:bg-white/5"
                  }`}
                >
                  Filmlər
                </button>
              ) : (
                <Link
                  href="/#filmler"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-white/5"
                >
                  Filmlər
                </Link>
              )}

              <Link
                href="/siyahim"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium ${
                  isWatchlistPage
                    ? "bg-accent/15 text-accent"
                    : "text-foreground hover:bg-white/5"
                }`}
              >
                <span>Mənim siyahım</span>
                {watchlistCount > 0 && (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-white">
                    {watchlistCount}
                  </span>
                )}
              </Link>
            </div>

            {onPickRandom && (
              <button
                type="button"
                onClick={() => {
                  onPickRandom();
                  setIsMobileMenuOpen(false);
                }}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white"
              >
                <Shuffle className="h-4 w-4" aria-hidden="true" />
                <span>Mənə film seç</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
