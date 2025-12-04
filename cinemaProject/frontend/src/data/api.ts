import type { Movie } from "../types/Movie";

// Use localhost to share cookies (session/CSRF) with auth endpoints
const API_URL = "http://localhost:8000/api";

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

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
    showtimes: Array.isArray(m.showtimes)
      ? m.showtimes.map((s: any) => ({
          id: Number(s.id),
          startsAt: String(s.starts_at),
          format: s.format,
          basePrice: s.base_price ? Number(s.base_price) : undefined,
          movieRoom: s.movie_room ? Number(s.movie_room) : undefined,
          movieRoomName: s.movie_room_name ?? null,
        }))
      : [],
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
    showtimes: Array.isArray(m.showtimes)
      ? m.showtimes.map((s: any) => ({
          id: Number(s.id),
          startsAt: String(s.starts_at),
          format: s.format,
          basePrice: s.base_price ? Number(s.base_price) : undefined,
          movieRoom: s.movie_room ? Number(s.movie_room) : undefined,
          movieRoomName: s.movie_room_name ?? null,
        }))
      : [],
  };
}

export async function fetchShowtimeSeats(id: number) {
  const res = await fetch(`${API_URL}/showtimes/${id}/seats/`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to load seat map");
  return res.json();
}

export async function createBooking(
  showtimeId: number,
  seats: { seat: number; ticket_type: string }[],
  payment: { method: string; card_last4?: string; card_id?: number },
  promoCode?: string
) {
  const csrf = getCookie("csrftoken");
  const res = await fetch(`${API_URL}/bookings/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(csrf ? { "X-CSRFToken": csrf } : {}),
    },
    credentials: "include",
    body: JSON.stringify({
      showtime: showtimeId,
      seats,
      payment_method: payment.method,
      payment_last4: payment.card_last4,
      payment_card_id: payment.card_id,
      promo_code: promoCode || undefined,
    }),
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const error = await res.json();
      message =
        error.error ||
        error.detail ||
        error.message ||
        JSON.stringify(error);
    } catch {
      const text = await res.text().catch(() => "");
      if (text) message = text;
    }
    throw new Error(message || "Booking failed");
  }

  return res.json();
}

export async function fetchMyBookings() {
  const res = await fetch(`${API_URL}/bookings/my/`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load bookings");
  return res.json();
}

export async function validatePromoCode(code: string) {
  const csrf = getCookie("csrftoken");
  const res = await fetch(`${API_URL}/promotions/validate/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(csrf ? { "X-CSRFToken": csrf } : {}),
    },
    credentials: "include",
    body: JSON.stringify({ promo_code: code }),
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const error = await res.json();
      message =
        error.error ||
        error.detail ||
        error.message ||
        JSON.stringify(error);
    } catch {
      const text = await res.text().catch(() => "");
      if (text) message = text;
    }
    throw new Error(message || "Invalid promo code");
  }

  return res.json();
}
