// TypeScript interfaces for our movie data.
// These ensure we don’t make mistakes with missing properties or wrong data types.

export interface MovieShowtime {
    id: number;
    startsAt: string; // ISO string
    format?: string;
    movieRoom?: number;
    movieRoomName?: string | null;
    basePrice?: number;
}

// Main movie interface - every movie object must have all these properties
export interface Movie {
    id: number; // unique number for each movie
    slug: string; // URL-friendly identifier (e.g., "inception")
    title: string; // movie title
    genre: string; // movie type (Action, Comedy, Horror, etc.)
    rating: string; // age rating like G, PG, PG-13, R
    description: string; // short summary of what the movie is about

    poster: string; // image URL for movie poster

    // 🎥 NEW: YouTube trailer video ID (instead of full URL)
    trailerId?: string;

    showtimes: MovieShowtime[]; // times when the movie plays
    category: 'currently-running' | 'coming-soon'; // theater status

    // Added fields
    duration?: number; // runtime in minutes
    releaseDate?: string; // release date (ISO format string from Django)

    // Optional extra details (Django may not always send these)
    synopsis?: string;
    cast?: string[];
    director?: string;
    producer?: string;
    showDates?: string[];
    reviews?: string;
}

// Booking interface - when someone reserves tickets
export interface BookingInfo {
    movieId: number; // ID of the movie
    movieTitle: string; // movie title (easy lookup for display)
    showtime: string; // time they’re watching
    showDate: string; // date they’re watching
}
