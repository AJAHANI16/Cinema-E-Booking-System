import { useParams, Link } from "react-router-dom";
import type { Movie } from "../types/Movie";

interface MovieDetailsPageProps {
  movies: Movie[];
}

const MovieDetailsPage = ({ movies }: MovieDetailsPageProps) => {
  const { slug } = useParams<{ slug: string }>();
  const movie = movies.find((m) => m.slug === slug);

  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <h1 className="text-2xl text-gray-600">Movie not found</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link
            to="/"
            className="text-blue-500 hover:text-blue-600 font-medium"
          >
            ← Back to Movies
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left: Poster */}
        <div className="flex flex-col items-center">
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-full max-w-sm rounded-lg shadow-lg"
          />
        </div>

        {/* Right: Details */}
        <div className="flex flex-col">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {movie.title}
          </h1>

          <p className="text-gray-600 mb-6">{movie.description}</p>

          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-gray-700">
            <p>
              <span className="font-semibold">Genre:</span> {movie.genre}
            </p>
            <p>
              <span className="font-semibold">Rating:</span> {movie.rating}
            </p>
            <p>
              <span className="font-semibold">Duration:</span>{" "}
              {movie.duration} min
            </p>
            <p>
              <span className="font-semibold">Release Date:</span>{" "}
              {movie.releaseDate
                ? new Date(movie.releaseDate).toLocaleDateString()
                : "TBA"}
            </p>
            {movie.director && (
              <p>
                <span className="font-semibold">Director:</span>{" "}
                {movie.director}
              </p>
            )}
            {movie.producer && (
              <p>
                <span className="font-semibold">Producer:</span>{" "}
                {movie.producer}
              </p>
            )}
            {movie.cast && (
              <p className="col-span-2">
                <span className="font-semibold">Cast:</span>{" "}
                {movie.cast.join(", ")}
              </p>
            )}
          </div>

          {/* Showtimes */}
          {movie.showtimes && movie.showtimes.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Showtimes
              </h3>
              <div className="flex flex-wrap gap-2">
                {movie.showtimes.map((showtime) => (
                  <Link
                    key={showtime.id}
                    to={`/booking/${movie.slug}?showtime=${showtime.id}`}
                    className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 transition"
                  >
                    {new Date(showtime.startsAt).toLocaleString(undefined, {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Trailer */}
          {movie.trailerId && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Trailer
              </h3>
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${movie.trailerId}`}
                  title={`${movie.title} Trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </div>
          )}

          {/* Reviews */}
          {movie.reviews && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Reviews
              </h3>
              <p className="text-gray-600">{movie.reviews}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsPage;
