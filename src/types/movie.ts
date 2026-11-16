export interface Movie {
  id: string;
  title: string;
  year: number;
  genres: string[];
  description: string;
  director: string;
  cast: string[];
  youtubeId: string;
  duration: string;
  rating: number;
  thumbnail: string;
}

export type SortOption = "rating-desc" | "year-desc" | "year-asc" | "title-asc";
