import { Link } from 'react-router-dom';
import type { Movie } from '../types/Movie';

// this tells the component what props it should expect
interface HomePageProps {
  movies: Movie[]; // list of movies to show on home page
}

// main home page - shows all the movies split into running now and coming soon
const HomePage = ({ movies }: HomePageProps) => {
  // seperate movies into 2 groups based on category
  const currentlyRunning = movies.filter(movie => movie.category === 'currently-running');
  const comingSoon = movies.filter(movie => movie.category === 'coming-soon');

  // this is a reusable component for each movie card
  const MovieCard = ({ movie }: { movie: Movie }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* movie poster image */}
      <img
        src={movie.poster}
        alt={movie.title}
        className="w-full h-64 object-cover" // make image fill the space nicely
      />
      
      {/* all the movie info goes here */}
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{movie.title}</h3>
        
        {/* rating badge and genre */}
        <p className="text-gray-600 mb-2">
          <span className="bg-gray-200 px-2 py-1 rounded text-sm">{movie.rating}</span>
          <span className="ml-2 text-sm">{movie.genre}</span>
        </p>
        
        {/* movie description but cut it off if too long */}
        <p className="text-gray-700 text-sm mb-3 line-clamp-3">{movie.description}</p>
        
        {/* show all the different showtimes */}
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-700 mb-1">Showtimes:</p>
          <div className="flex flex-wrap gap-1">
            {/* make a button for each showtime */}
            {movie.showtimes.map((time, index) => (
              <Link
                key={index}
                to={`/booking/${movie.id}?showtime=${encodeURIComponent(time)}`} // go to booking page with this time
                className="bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600 transition-colors"
              >
                {time}
              </Link>
            ))}
          </div>
        </div>
        
        {/* button to see more details about the movie */}
        <Link
          to={`/movie/${movie.id}`}
          className="block w-full bg-gray-800 text-white text-center py-2 rounded hover:bg-gray-700 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* section for movies that are playing right now */}
      <section className="mb-8">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Currently Running</h2>
        {/* grid layout - changes based on screen size */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentlyRunning.map(movie => (
            <MovieCard key={movie.id} movie={movie} /> // show each movie
          ))}
        </div>
      </section>

      {/* section for movies coming soon */}
      <section>
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Coming Soon</h2>
        {/* same grid layout as above */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {comingSoon.map(movie => (
            <MovieCard key={movie.id} movie={movie} /> // show each coming soon movie
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;