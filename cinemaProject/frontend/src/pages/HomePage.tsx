// src/pages/HomePage.tsx
import { Link } from "react-router-dom";
import type { Movie } from "../types/Movie";

interface HomePageProps {
  movies: Movie[];
}

const HomePage = ({ movies }: HomePageProps) => {
  const currentlyRunning = movies.filter((m) => m.category === "currently-running");
  const comingSoon = movies.filter((m) => m.category === "coming-soon");

  const MovieCard = ({ movie }: { movie: Movie }) => (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl border border-gray-200 transition-all w-[95%] max-w-[280px] flex flex-col overflow-hidden">
      {/* Poster */}
      <div className="w-full h-[340px]">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {movie.title}
          </h3>

          {/* Rating + Genre */}
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-yellow-100 text-yellow-800 border border-yellow-300 px-2 py-0.5 rounded text-xs font-medium">
              {movie.rating}
            </span>
            <span className="bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded text-xs font-medium">
              {movie.genre}
            </span>
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
            {movie.description}
          </p>

          {/* Showtimes */}
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-700 mb-1">Showtimes:</p>
            <div className="flex flex-wrap gap-2">
              {movie.showtimes.map((time, index) => (
                <Link
                  key={index}
                  to={`/booking/${movie.slug}?showtime=${encodeURIComponent(time)}`}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs px-2.5 py-1 rounded-md shadow hover:opacity-90 transition-all"
                >
                  {time}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Details button */}
        <Link
          to={`/movie/${movie.slug}`}
          className="mt-auto block bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 text-center py-2 rounded-md font-semibold hover:opacity-90 transition-all shadow-sm"
        >
          View Details
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 py-10 px-6 flex flex-col items-center">
      {/* Currently Running */}
      <section className="mb-16 w-full max-w-7xl">
        <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent drop-shadow">
          Now Showing
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
          {currentlyRunning.map((movie) => (
            <MovieCard key={movie.slug} movie={movie} />
          ))}
          {currentlyRunning.length === 0 && (
            <p className="text-gray-500 text-center col-span-full">
              No movies currently running.
            </p>
          )}
        </div>
      </section>

      {/* Coming Soon */}
      <section className="w-full max-w-7xl">
        <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent drop-shadow">
          Coming Soon
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
          {comingSoon.map((movie) => (
            <MovieCard key={movie.slug} movie={movie} />
          ))}
          {comingSoon.length === 0 && (
            <p className="text-gray-500 text-center col-span-full">
              No upcoming movies yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;