// src/admin/AdminNavbar.tsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

const AdminNavbar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { name: "Users", path: "/admin/manage-users" },
    { name: "Movies", path: "/admin/manage-movies" },
    { name: "Promotions", path: "/admin/manage-promotions" },
    { name: "Showtimes", path: "/admin/manage-showtimes" },
  ];

  return (
    <nav className="bg-gray-800 text-white shadow-md px-6 py-4 flex items-center justify-between">
      {/* Left Links */}
      <div className="flex items-center space-x-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`px-3 py-2 rounded-md transition ${
              location.pathname === item.path
                ? "bg-gray-700 font-semibold"
                : "hover:bg-gray-700"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </div>

      {/* Right Link */}
      <div>
        <Link
          to="/"
          className="px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 transition"
        >
          Back to Home
        </Link>
      </div>
    </nav>
  );
};

export default AdminNavbar;
