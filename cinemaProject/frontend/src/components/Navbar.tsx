import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { Movie } from "../types/Movie";

interface NavbarProps {
  onSearch?: (query: string) => void;
  onFilter?: (genre: string) => void;
  movies?: Movie[];
}

const Navbar = ({ onSearch, onFilter, movies }: NavbarProps) => {
  const location = useLocation();
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  // hide navbar on login/register pages
  const hideNavbar =
    location.pathname === "/login" || location.pathname === "/register";
  if (hideNavbar) return null;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // unique genres for filter dropdown
  const genres = movies ? Array.from(new Set(movies.map((m) => m.genre))) : [];

  return (
    <nav className="bg-gray-800 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      {/* logo/site name */}
      <Link
        to="/"
        className="text-white font-bold text-lg hover:text-gray-300 transition-colors"
      >
        🎬 Cinema E-Booking
      </Link>

      {/* search + filter */}
      {onSearch && onFilter && (
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search movies…"
            onChange={(e) => onSearch(e.target.value)}
            className="px-3 py-2 text-black bg-white rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {movies && (
            <select
              onChange={(e) => onFilter(e.target.value)}
              className="px-3 py-2 text-black bg-white rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* nav links */}
      <div className="flex items-center gap-4">
        {isLoading ? (
          <div className="text-white">Loading...</div>
        ) : isAuthenticated && user ? (
          <>
            <span className="text-white">
              Welcome, {user.first_name || user.username}!
            </span>
            <button
              onClick={handleLogout}
              className="text-white hover:text-gray-300 transition-colors px-3 py-1 border border-white rounded hover:bg-white hover:text-gray-800"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-white hover:text-gray-300 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-white hover:text-gray-300 transition-colors px-3 py-1 border border-white rounded hover:bg-white hover:text-gray-800"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;