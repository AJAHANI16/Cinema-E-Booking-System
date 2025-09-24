import { useParams, Link } from 'react-router-dom';
import type { Movie } from '../types/Movie';

// props interface - what this component expects to recieve
interface MovieDetailsPageProps {
  movies: Movie[]; // all movies so we can find the one we want
}

// shows detailed info about a single movie including trailer
const MovieDetailsPage = ({ movies }: MovieDetailsPageProps) => {
  // get movie ID from the URL (like /movie/1)
  const { id } = useParams<{ id: string }>();
  
  // find the movie with matching ID (convert string to number first)
  const movie = movies.find(m => m.id === parseInt(id || '0'));

  // if we cant find the movie, show error
  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <h1 className="text-2xl text-gray-600">Movie not found</h1>
      </div>
    );
  }

  // this function gets the video ID from youtube URL so we can embed it
  const getYouTubeVideoId = (url: string) => {
    // regex to match youtube URLs and extract the video ID part
    const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
    return match ? match[1] : null; // return the ID or null if we cant find it
  };

  // get video ID from trailer URL
  const videoId = getYouTubeVideoId(movie.trailerUrl);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* header with back button */}
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

      {/* main content area */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* left side - poster and basic info */}
          <div>
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-full max-w-md mx-auto rounded-lg shadow-lg" // center poster and add shadow
            />
            
            {/* movie details like genre, rating etc */}
            <div className="mt-6 space-y-3">
              <div>
                <h3 className="font-semibold text-gray-700">Genre:</h3>
                <p className="text-gray-600">{movie.genre}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700">Rating:</h3>
                <p className="text-gray-600">{movie.rating}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700">Director:</h3>
                <p className="text-gray-600">{movie.director}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700">Cast:</h3>
                <p className="text-gray-600">{movie.cast.join(', ')}</p> {/* turn array into comma seperated list */}
              </div>
            </div>
          </div>

          {/* right side - movie description and trailer */}
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">{movie.title}</h1>
            
            {/* plot synopsis */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Synopsis</h3>
              <p className="text-gray-600 leading-relaxed">{movie.description}</p>
            </div>

            {/* embedded youtube trailer (only show if we got valid video ID) */}
            {videoId && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">Trailer</h3>
                {/* responsive video container */}
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title={`${movie.title} Trailer`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  ></iframe>
                </div>
              </div>
            )}

            {/* showtimes and booking buttons */}
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-3">Showtimes & Booking</h3>
              
              {/* make clickable buttons for each showtime */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {movie.showtimes.map((time, index) => (
                  <Link
                    key={index}
                    to={`/booking/${movie.id}?showtime=${encodeURIComponent(time)}`} // go to booking page with time
                    className="bg-blue-500 text-white py-3 px-4 rounded-lg text-center font-medium hover:bg-blue-600 transition-colors"
                  >
                    {time}
                  </Link>
                ))}
              </div>
              
              {/* helpful text */}
              <p className="mt-4 text-sm text-gray-600">
                Click on a showtime to book your tickets. All times shown are in local timezone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsPage;