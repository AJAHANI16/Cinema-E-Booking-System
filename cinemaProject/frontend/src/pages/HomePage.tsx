import {Link} from "react-router-dom";
import type {Movie} from "../types/Movie";

interface HomePageProps {
    movies: Movie[];
}

const HomePage = ({movies}: HomePageProps) => {
    const currentlyRunning = movies.filter(
        (m) => m.category === "currently-running"
    );
    const comingSoon = movies.filter((m) => m.category === "coming-soon");

    const MovieCard = ({movie}: { movie: Movie }) => (
        <div
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all w-[95%] max-w-[280px] flex flex-col overflow-hidden">
            {/* Poster */}
            <div className="w-full h-[360px]"> {/* taller for poster ratio */}
                <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Info */}
            <div className="p-3 flex flex-col justify-between flex-1">
                <div>
                    <h3 className="text-lg font-semibold mb-2">{movie.title}</h3>

                    {/* Rating and Genre */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-gray-200 px-2 py-1 rounded text-sm">
                        {movie.rating}
                      </span>
                        <span className="bg-gray-100 px-2 py-1 rounded text-sm text-gray-700">
                        {movie.genre}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm mb-3 line-clamp-3">
                        {movie.description}
                    </p>

                    <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Showtimes:</p>
                        <div className="flex flex-wrap gap-1">
                            {movie.showtimes.map((time, index) => (
                                <Link
                                    key={index}
                                    to={`/booking/${movie.slug}?showtime=${encodeURIComponent(
                                        time
                                    )}`}
                                    className="bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                                >
                                    {time}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                <Link
                    to={`/movie/${movie.slug}`}
                    className="mt-auto block bg-gray-800 text-white text-center py-2 rounded hover:bg-gray-700 transition-colors text-sm"
                >
                    View Details
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
            {/* Currently Running */}
            <section className="mb-12 w-full max-w-7xl">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
                    Currently Running
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
                    {currentlyRunning.map((movie) => (
                        <MovieCard key={movie.slug} movie={movie}/>
                    ))}
                </div>
            </section>

            {/* Coming Soon */}
            <section className="w-full max-w-7xl">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
                    Coming Soon
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
                    {comingSoon.map((movie) => (
                        <MovieCard key={movie.slug} movie={movie}/>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default HomePage;