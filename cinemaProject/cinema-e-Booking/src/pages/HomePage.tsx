// src/pages/HomePage.tsx
import {Link} from "react-router-dom";
import {useEffect, useState} from "react";
import type {Movie} from "../types/Movie";

const HomePage = () => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/movies/") // Django backend API
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((data) => setMovies(data))
            .catch((err) => {
                console.error("Error fetching movies:", err);
                setError(String(err));
            });
    }, []);

    // ✅ Use status from DB instead of checking release_date
    const currentlyRunning = movies.filter((movie) => movie.status === "running");
    const comingSoon = movies.filter((movie) => movie.status === "coming_soon");

    const MovieCard = ({movie}: { movie: Movie }) => (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
            {/* Poster */}
            <img
                src={movie.poster_url ?? "https://via.placeholder.com/300x450"}
                alt={movie.title}
                className="w-full h-48 object-cover"
            />

            {/* Info */}
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold mb-2">{movie.title}</h3>

                <p className="text-gray-600 mb-2">
          <span className="bg-gray-200 px-2 py-1 rounded text-sm">
            {movie.rating ?? "NR"}
          </span>
                    <span className="ml-2 text-sm">{movie.genre ?? ""}</span>
                </p>

                {/* Clamp description */}
                <p className="text-gray-700 text-sm mb-3 line-clamp-3 flex-grow">
                    {movie.description}
                </p>

                {/* Showtimes */}
                <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Showtimes:</p>
                    <div className="flex flex-wrap gap-1">
                        {(movie.showtimes ?? []).map((time, index) => (
                            <Link
                                key={index}
                                to={`/booking/${movie.id}?showtime=${encodeURIComponent(time)}`}
                                className="bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                            >
                                {time}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="mt-auto">
                    <Link
                        to={`/movie/${movie.id}`}
                        className="block w-full bg-gray-800 text-white text-center py-2 rounded hover:bg-gray-700 transition-colors"
                    >
                        View Details
                    </Link>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-screen-xl mx-auto">
                {error && (
                    <div className="mb-4 text-red-600">Error loading movies: {error}</div>
                )}

                {/* Currently Running */}
                <section className="mb-8">
                    <h2 className="text-3xl font-bold mb-6 text-gray-800">
                        Currently Running
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-center">
                        {currentlyRunning.map((movie) => (
                            <MovieCard key={movie.id} movie={movie}/>
                        ))}
                    </div>
                </section>

                {/* Coming Soon */}
                <section>
                    <h2 className="text-3xl font-bold mb-6 text-gray-800">Coming Soon</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-center">
                        {comingSoon.map((movie) => (
                            <MovieCard key={movie.id} movie={movie}/>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default HomePage;