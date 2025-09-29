import type { Movie } from "../types/Movie";

const API_URL = "http://127.0.0.1:8000/api";

export async function fetchMovies(): Promise<Movie[]> {
  const res = await fetch(`${API_URL}/movies/`);
  if (!res.ok) throw new Error(`Failed to fetch movies: ${res.statusText}`);
  const data = await res.json();

  // 🔑 Convert snake_case → camelCase
  return data.map((m: any) => ({
    ...m,
    poster: m.movie_poster_URL || m.poster || "",
    trailerUrl: m.trailer_url || m.trailerUrl || "",
    duration: m.duration || 0,
    releaseDate: m.release_date || null,
    category: m.category || "currently-running",
    slug: m.slug,
  }));
}

export async function fetchMovie(slug: string): Promise<Movie> {
  const res = await fetch(`${API_URL}/movies/${slug}/`);
  if (!res.ok) throw new Error("Movie not found");
  const m = await res.json();

  return {
    ...m,
    poster: m.movie_poster_URL || m.poster || "",
    trailerUrl: m.trailer_url || m.trailerUrl || "",
    duration: m.duration || 0,
    releaseDate: m.release_date || null,
    category: m.category || "currently-running",
    slug: m.slug,
  };
}