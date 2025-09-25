// src/pages/MovieDetailsPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Movie } from "../types/Movie";

const MovieDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    fetch(`http://127.0.0.1:8000/api/movies/${id}/`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setMovie(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching movie:", err);
        setError(String(err));
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">Error: {error}</div>;
  }

  if (!movie) {
    return <div className="p-8">Movie not found</div>;
  }

  // build YouTube embed URL from youtube id (if present)
  const embedUrl = movie.trailer_youtube_id
    ? `https://www.youtube.com/embed/${movie.trailer_youtube_id}`
    : null;

  const showtimes = movie.showtimes ?? ["2:00 PM", "5:00 PM", "8:00 PM"];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex gap-6">
        <img
          src={movie.poster_url ?? "https://via.placeholder.com/300x450"}
          alt={movie.title}
          className="w-56 object-cover rounded"
        />
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
          <p className="text-sm text-gray-600 mb-4">
            {movie.rating ?? "NR"} • {movie.genre ?? "Unknown genre"}
          </p>
          <p className="text-gray-800 mb-4">{movie.description}</p>

          <div>
            <h3 className="font-semibold mb-2">Showtimes</h3>
            <div className="flex gap-2">
              {showtimes.map((s) => (
                <button
                  key={s}
                  onClick={() =>
                    navigate(`/booking/${movie.id}?showtime=${encodeURIComponent(s)}`, {
                      state: { movie, showtime: s },
                    })
                  }
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Trailer</h3>
        {embedUrl ? (
          <div className="aspect-video">
            <iframe
              width="100%"
              height="480"
              src={embedUrl}
              title={`${movie.title} trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div>No trailer available</div>
        )}
      </div>
    </div>
  );
};

export default MovieDetailsPage;