import rawMovies from "@/data/movies.json";
import type { Movie, SortOption } from "@/types/movie";

function normalizeGenreName(genre: string): string {
  const trimmed = genre.trim();
  if (trimmed.toLocaleLowerCase("az") === "musikl") {
    return "Muzikl";
  }
  return trimmed;
}

function normalizeForSearch(text: string): string {
  return text
    .toLocaleLowerCase("az")
    .replace(/ə/g, "e")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u");
}

const movies: Movie[] = (rawMovies as Movie[]).map((movie) => {
  const normalizedGenres = movie.genres.map(normalizeGenreName);
  if (movie.year < 1991 && !normalizedGenres.includes("Klassika")) {
    normalizedGenres.push("Klassika");
  }

  return {
    ...movie,
    title: movie.title.trim(),
    director: movie.director.trim(),
    genres: Array.from(new Set(normalizedGenres)),
  };
});

export function getAllMovies(): Movie[] {
  return movies;
}

export function getMovieById(id: string): Movie | undefined {
  return movies.find((movie) => movie.id === id);
}

export function getAllGenres(): string[] {
  const genreSet = new Set<string>();
  for (const movie of movies) {
    for (const genre of movie.genres) {
      genreSet.add(genre);
    }
  }
  return Array.from(genreSet).sort((a, b) => a.localeCompare(b, "az"));
}

export function getMoviesByGenre(genre: string): Movie[] {
  const normalized = genre.trim().toLocaleLowerCase("az");
  return movies.filter((movie) =>
    movie.genres.some((g) => g.toLocaleLowerCase("az") === normalized)
  );
}

export function getFeaturedMovies(limit = 4): Movie[] {
  return [...movies].sort((a, b) => b.rating - a.rating).slice(0, limit);
}

export function getClassicMovies(list: Movie[] = movies): Movie[] {
  return list.filter((movie) => movie.year < 1991);
}

export function getTrendingMovies(list: Movie[] = movies): Movie[] {
  return [...list].sort((a, b) => {
    const scoreA = a.rating * 2 + (a.year >= 1990 ? 1.5 : 0) + a.year / 10000;
    const scoreB = b.rating * 2 + (b.year >= 1990 ? 1.5 : 0) + b.year / 10000;
    return scoreB - scoreA;
  });
}

export function filterMovies(
  list: Movie[],
  query: string,
  genre: string
): Movie[] {
  const rawQuery = query.trim().toLocaleLowerCase("az");
  const asciiQuery = normalizeForSearch(query.trim());
  const normalizedGenre = genre.trim().toLocaleLowerCase("az");

  return list.filter((movie) => {
    const matchesGenre =
      !normalizedGenre ||
      movie.genres.some(
        (g) => g.toLocaleLowerCase("az") === normalizedGenre
      );

    if (!matchesGenre) return false;
    if (!rawQuery) return true;

    const fields = [movie.title, movie.director, ...movie.cast, ...movie.genres];
    return fields.some((field) => {
      const lowerField = field.toLocaleLowerCase("az");
      const asciiField = normalizeForSearch(field);
      return lowerField.includes(rawQuery) || asciiField.includes(asciiQuery);
    });
  });
}

export function getRandomMovie(
  genre?: string,
  excludeId?: string,
  list: Movie[] = movies
): Movie | undefined {
  const normalizedGenre = genre?.trim().toLocaleLowerCase("az") ?? "";

  const pool = normalizedGenre
    ? list.filter((movie) =>
        movie.genres.some(
          (g) => g.toLocaleLowerCase("az") === normalizedGenre
        )
      )
    : list;

  if (pool.length === 0) return undefined;
  if (pool.length === 1) return pool[0];

  const candidates = excludeId
    ? pool.filter((movie) => movie.id !== excludeId)
    : pool;

  const finalPool = candidates.length > 0 ? candidates : pool;
  const randomIndex = Math.floor(Math.random() * finalPool.length);
  return finalPool[randomIndex];
}

export function sortMovies(list: Movie[], sortBy: SortOption): Movie[] {
  const copy = [...list];
  switch (sortBy) {
    case "rating-desc":
      return copy.sort((a, b) => b.rating - a.rating || a.year - b.year);
    case "year-desc":
      return copy.sort((a, b) => b.year - a.year || b.rating - a.rating);
    case "year-asc":
      return copy.sort((a, b) => a.year - b.year);
    case "title-asc":
      return copy.sort((a, b) => a.title.localeCompare(b.title, "az"));
  }
}

export function getYouTubeFallbackThumbnail(youtubeId: string): string {
  return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
}
