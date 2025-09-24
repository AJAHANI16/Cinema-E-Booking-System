import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Movie } from '../types/Movie';

// props for the navbar - this tells it what functions to call when stuff happens
interface NavbarProps {
  onSearch: (query: string) => void;  // when someone types in search box
  onFilter: (genre: string) => void;  // when they pick a genre from dropdown
  movies: Movie[];                    // all the movies so we can make genre list
}

// this is the top navigation bar that shows on every page
const Navbar = ({ onSearch, onFilter, movies }: NavbarProps) => {
  // keep track of what user typed and what genre they picked
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');

  // get all the different genres from movies (no duplicates)
  const genres = Array.from(new Set(movies.map(movie => movie.genre)));

  // when user types in search box, update our state and tell parent component
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query); // this calls the function passed from App.tsx
  };

  // same thing but for genre filter dropdown
  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const genre = e.target.value;
    setSelectedGenre(genre);
    onFilter(genre); // tell parent component about the change
  };

  return (
    <nav className="bg-gray-800 p-4 flex items-center justify-between">
      
      {/* logo/site name on the left */}
      <Link 
        to="/" 
        className="text-white font-bold text-lg hover:text-gray-300 transition-colors"
      >
        🎬 Cinema E-Booking
      </Link>

      {/* search and filter stuff in the middle */}
      <div className="flex flex-1 mx-4 gap-2">
        
        {/* search input - user can type movie names here */}
        <input
          type="text"
          placeholder="Search movies by title..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full px-3 py-2 text-black bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        {/* dropdown to filter by genre */}
        <select 
          value={selectedGenre}
          onChange={handleGenreChange}
          className="ml-2 px-3 py-2 text-black bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Genres</option>
          {/* loop thru genres and make option for each one */}
          {genres.map(genre => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </div>

      {/* navigation links on the right side */}
      <div className="space-x-4">
        <Link 
          to="/" 
          className="text-white hover:text-gray-300 transition-colors"
        >
          Home
        </Link>
        <a 
          href="#" 
          className="text-white hover:text-gray-300 transition-colors"
        >
          About
        </a>
        <a 
          href="#" 
          className="text-white hover:text-gray-300 transition-colors"
        >
          Contact
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
