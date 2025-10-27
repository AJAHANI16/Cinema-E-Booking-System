// src/App.tsx
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import MovieDetailsPage from "./pages/MovieDetailsPage";
import BookingPage from "./pages/BookingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ProfilePage from "./pages/ProfilePage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import type { Movie } from "./types/Movie";
import { fetchMovies } from "./data/api";

function AppContent() {
  const location = useLocation();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");

  // Fetch movies from backend on load
  useEffect(() => {
    const loadMovies = async () => {
      try {
        const data = await fetchMovies();

        // Normalize and cast backend movie objects into Movie[]
        const normalized: Movie[] = (data as unknown[]).map((m) => {
          const movie = m as Record<string, unknown>;

          return {
            id: Number(movie.id ?? 0),
            slug: String(movie.slug ?? movie.id ?? ""),
            title: String(movie.title ?? ""),
            genre: String(movie.genre ?? "Unknown"),
            rating: String(movie.rating ?? "NR"),
            description: String(movie.description ?? ""),
            poster: String(
              (movie.poster as string) ??
                (movie.movie_poster_URL as string) ??
                ""
            ),
            trailerId: String(
              (movie.trailerId as string) ??
                (movie.trailer_id as string) ??
                ""
            ),
            showtimes: Array.isArray(movie.showtimes)
              ? (movie.showtimes as string[])
              : ["2:00 PM", "5:00 PM", "8:00 PM"],
            category:
              (movie.category as "currently-running" | "coming-soon") ??
              "currently-running",
            duration: movie.duration ? Number(movie.duration) : undefined,
            releaseDate: movie.releaseDate
              ? String(movie.releaseDate)
              : movie.release_date
              ? String(movie.release_date)
              : undefined,
          };
        });

        setMovies(normalized);
      } catch (err) {
        console.error("Error fetching movies:", err);
      }
    };

    loadMovies();
  }, []);

  // Filter movies by search and genre
  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      const matchesSearch =
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGenre = !selectedGenre || movie.genre === selectedGenre;
      return matchesSearch && matchesGenre;
    });
  }, [movies, searchQuery, selectedGenre]);

  // Determine if Navbar should be hidden
  const hideNavbar = ["/login", "/register", "/reset-password", "/verify-email"].some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {!hideNavbar && (
        <Navbar
          onSearch={setSearchQuery}
          onFilter={setSelectedGenre}
          movies={movies}
        />
      )}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage movies={filteredMovies} />} />
        <Route path="/movie/:slug" element={<MovieDetailsPage movies={movies} />} />
        <Route path="/booking/:slug" element={<BookingPage movies={movies} />} />

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

        {/* User Profile */}
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}