"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getAllMovies } from "@/lib/movies";
import type { Movie } from "@/types/movie";

const WATCHLIST_STORAGE_KEY = "netflix-az-watchlist";
const WATCHLIST_EVENT_NAME = "netflix-az-watchlist-updated";

function readWatchlistFromStorage(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return Array.from(
      new Set(parsed.filter((item): item is string => typeof item === "string"))
    );
  } catch {
    return [];
  }
}

function writeWatchlistToStorage(ids: string[]): void {
  if (typeof window === "undefined") return;

  try {
    const uniqueIds = Array.from(new Set(ids));
    window.localStorage.setItem(
      WATCHLIST_STORAGE_KEY,
      JSON.stringify(uniqueIds)
    );
    window.dispatchEvent(
      new CustomEvent<string[]>(WATCHLIST_EVENT_NAME, { detail: uniqueIds })
    );
  } catch {
    // localStorage məhdudiyyəti zamanı səhifənin çökməsinin qarşısını alır
  }
}

export function useWatchlist() {
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setWatchlistIds(readWatchlistFromStorage());
    setIsLoaded(true);

    const handleCustomSync = (event: Event) => {
      const customEvent = event as CustomEvent<string[]>;
      if (Array.isArray(customEvent.detail)) {
        setWatchlistIds(customEvent.detail);
      } else {
        setWatchlistIds(readWatchlistFromStorage());
      }
    };

    const handleStorageSync = (event: StorageEvent) => {
      if (event.key === WATCHLIST_STORAGE_KEY) {
        setWatchlistIds(readWatchlistFromStorage());
      }
    };

    window.addEventListener(WATCHLIST_EVENT_NAME, handleCustomSync);
    window.addEventListener("storage", handleStorageSync);

    return () => {
      window.removeEventListener(WATCHLIST_EVENT_NAME, handleCustomSync);
      window.removeEventListener("storage", handleStorageSync);
    };
  }, []);

  const isInWatchlist = useCallback(
    (movieId: string) => watchlistIds.includes(movieId),
    [watchlistIds]
  );

  const addToWatchlist = useCallback((movieOrId: Movie | string) => {
    const id = typeof movieOrId === "string" ? movieOrId : movieOrId.id;
    const current = readWatchlistFromStorage();
    if (current.includes(id)) return;

    const updated = [...current, id];
    setWatchlistIds(updated);
    writeWatchlistToStorage(updated);
  }, []);

  const removeFromWatchlist = useCallback((movieOrId: Movie | string) => {
    const id = typeof movieOrId === "string" ? movieOrId : movieOrId.id;
    const current = readWatchlistFromStorage();
    if (!current.includes(id)) return;

    const updated = current.filter((item) => item !== id);
    setWatchlistIds(updated);
    writeWatchlistToStorage(updated);
  }, []);

  const toggleWatchlist = useCallback((movieOrId: Movie | string) => {
    const id = typeof movieOrId === "string" ? movieOrId : movieOrId.id;
    const current = readWatchlistFromStorage();
    const exists = current.includes(id);
    const updated = exists
      ? current.filter((item) => item !== id)
      : [...current, id];

    setWatchlistIds(updated);
    writeWatchlistToStorage(updated);
  }, []);

  const clearWatchlist = useCallback(() => {
    setWatchlistIds([]);
    writeWatchlistToStorage([]);
  }, []);

  const watchlistMovies = useMemo(() => {
    const allMovies = getAllMovies();
    const movieMap = new Map(allMovies.map((m) => [m.id, m]));
    return watchlistIds
      .map((id) => movieMap.get(id))
      .filter((movie): movie is Movie => Boolean(movie));
  }, [watchlistIds]);

  return {
    watchlistIds,
    watchlistMovies,
    isLoaded,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
    clearWatchlist,
  };
}
