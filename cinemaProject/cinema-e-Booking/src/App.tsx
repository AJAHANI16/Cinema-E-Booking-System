import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useMemo } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import MovieDetailsPage from './pages/MovieDetailsPage';
import BookingPage from './pages/BookingPage';
import { mockMovies } from './data/mockMovies';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// main app component - this handles all the routing and keeps track of search/filter state
function App() {
  // these keep track of what the user is searching for and filtering by
  const [searchQuery, setSearchQuery] = useState('');   // what they typed in search box
  const [selectedGenre, setSelectedGenre] = useState(''); // which genre filter they picked

  // filter the movies based on search and genre - useMemo so it doesnt recalculate every render
  const filteredMovies = useMemo(() => {
    return mockMovies.filter(movie => {
      // check if movie title or description has the search words (ignore capitalization)
      const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           movie.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // check if genre matches (empty string means show all genres)
      const matchesGenre = !selectedGenre || movie.genre === selectedGenre;
      
      // movie has to match both search and genre to show up
      return matchesSearch && matchesGenre;
    });
  }, [searchQuery, selectedGenre]);

  // when user types in search box, update our searchQuery state
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // when user picks genre filter, update selectedGenre state
  const handleFilter = (genre: string) => {
    setSelectedGenre(genre);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        
        {/* navbar shows on every page and handles search/filter */}
        <Navbar 
          onSearch={handleSearch}    // pass our search function to navbar
          onFilter={handleFilter}    // pass our filter function to navbar
          movies={mockMovies}        // give navbar all movies so it can make genre list
        />
        
        {/* these are all the different pages/routes */}
        <Routes>
          {/* home page shows filtered movies */}
          <Route 
            path="/" 
            element={<HomePage movies={filteredMovies} />} 
          />
          
          {/* movie details page - the :id part comes from URL */}
          <Route 
            path="/movie/:id" 
            element={<MovieDetailsPage movies={mockMovies} />} 
          />
          
          {/* booking page for tickets */}
          <Route 
            path="/booking/:id" 
            element={<BookingPage movies={mockMovies} />} 
          />
          {/* login page */}
          <Route 
            path="/login"
            element={<LoginPage />} 
          />
          {/* register page */}
          <Route 
            path="/register"
            element={<RegisterPage />} 
          />
        </Routes>
        
      </div>
    </Router>
  );
}

export default App;