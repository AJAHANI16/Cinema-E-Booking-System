import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import MovieDetailsPage from "./pages/MovieDetailsPage";
import BookingPage from "./pages/BookingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import type { Movie } from "./types/Movie";
import { fetchMovies } from "./data/api"; // 👈 use backend API

function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");

  // fetch movies once on load
  useEffect(() => {
    fetchMovies()
      .then((data) => {
        const normalized = data.map((m: any) => ({
          ...m,
          poster: m.poster || m.movie_poster_URL || "",
          showtimes: m.showtimes || ["2:00 PM", "5:00 PM", "8:00 PM"],
          category: m.category || "currently-running",
          slug: m.slug || m.id?.toString(),
        }));
        setMovies(normalized);
      })
      .catch((err) => console.error("Error fetching movies:", err));
  }, []);

  // apply search + filter
  const filteredMovies = useMemo(() => {
    return movies.filter((movie: Movie) => {
      const matchesSearch =
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGenre = !selectedGenre || movie.genre === selectedGenre;

      return matchesSearch && matchesGenre;
    });
  }, [movies, searchQuery, selectedGenre]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar
          onSearch={setSearchQuery}
          onFilter={setSelectedGenre}
          movies={movies}
        />

        <Routes>
          <Route path="/" element={<HomePage movies={filteredMovies} />} />
          <Route
            path="/movie/:slug"
            element={<MovieDetailsPage movies={movies} />}
          />
          <Route
            path="/booking/:slug"
            element={<BookingPage movies={movies} />}
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;