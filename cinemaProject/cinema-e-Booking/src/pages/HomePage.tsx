import { Link } from 'react-router-dom';
import type { Movie } from '../types/Movie';
import { fetchMovies } from '../data/mockMovies';
import { useEffect, useState } from 'react';

const HomePage = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchTerm, setSearchTerm] = useState(''); // search text
  const [genreFilter, setGenreFilter] = useState('all'); // genre filter

  useEffect(() => {
    fetchMovies()
      .then(data => setMovies(data))
      .catch(err => console.error('Error fetching movies:', err));
  }, []);

  // --- filter logic ---
  const filteredMovies = movies.filter(movie => {
    const matchesSearch =
      movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGenre =
      genreFilter === 'all' || movie.genre.toLowerCase() === genreFilter.toLowerCase();

    return matchesSearch && matchesGenre;
  });

  // split after filtering
  const currentlyRunning = filteredMovies.filter(movie => movie.category === 'currently-running');
  const comingSoon = filteredMovies.filter(movie => movie.category === 'coming-soon');

  // movie card component
  const MovieCard = ({ movie }: { movie: Movie }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <img
        src={movie.poster}
        alt={movie.title}
        className="w-full h-64 object-cover"
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{movie.title}</h3>

        <p className="text-gray-600 mb-2">
          <span className="bg-gray-200 px-2 py-1 rounded text-sm">{movie.rating}</span>
          <span className="ml-2 text-sm">{movie.genre}</span>
        </p>

        <p className="text-gray-700 text-sm mb-3 line-clamp-3">{movie.description}</p>

        <div className="mb-3">
          <p className="text-sm font-medium text-gray-700 mb-1">Showtimes:</p>
          <div className="flex flex-wrap gap-1">
            {movie.showtimes.map((time, index) => (
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

        <Link
          to={`/movie/${movie.id}`}
          className="block w-full bg-gray-800 text-white text-center py-2 rounded hover:bg-gray-700 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );

  // derive all genres for dropdown
  const allGenres = Array.from(new Set(movies.map(m => m.genre))).sort();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* search + filter controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Search movies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 rounded border border-gray-300"
        />
        <select
          value={genreFilter}
          onChange={(e) => setGenreFilter(e.target.value)}
          className="px-4 py-2 rounded border border-gray-300"
        >
          <option value="all">All Genres</option>
          {allGenres.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      <section className="mb-8">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Currently Running</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentlyRunning.length === 0 && <p>No movies found.</p>}
          {currentlyRunning.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Coming Soon</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {comingSoon.length === 0 && <p>No movies found.</p>}
          {comingSoon.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;