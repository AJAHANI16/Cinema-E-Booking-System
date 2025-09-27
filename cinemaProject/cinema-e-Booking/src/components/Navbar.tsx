import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  // hide navbar on login/register
  const hideNavbar = location.pathname === "/login" || location.pathname === "/register";

  if (hideNavbar) return null;

  return (
    <nav className="bg-gray-800 p-4 flex items-center justify-between">
      {/* logo/site name on the left */}
      <Link
        to="/"
        className="text-white font-bold text-lg hover:text-gray-300 transition-colors"
      >
        🎬 Cinema E-Booking
      </Link>

      {/* navigation links on the right side */}
      <div className="space-x-4">
        <Link
          to="/login"
          className="text-white hover:text-gray-300 transition-colors"
        >
          Login / Register
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