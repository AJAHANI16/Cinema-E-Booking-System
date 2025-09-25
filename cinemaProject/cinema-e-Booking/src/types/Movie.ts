// src/types/Movie.ts
export type Movie = {
  id: number;
  title: string;
  rating?: string | null;
  description?: string | null;
  poster_url?: string | null;           // backend field
  trailer_youtube_id?: string | null;   // backend field
  genre?: string | null;
  status?: "running" | "coming_soon" | string;
  release_date?: string | null;
  showtimes?: string[];                 // provided by serializer
};