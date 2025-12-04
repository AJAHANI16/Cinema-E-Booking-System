// src/admin/AdminLayout.tsx
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaUsers, FaFilm, FaTags, FaClock } from "react-icons/fa";

type Props = {
  children: ReactNode;
};

export default function AdminLayout({ children }: Props) {
  const location = useLocation();

  const menuItems = [
    { name: "Manage Users", path: "/admin/manage-users", icon: <FaUsers /> },
    { name: "Manage Movies", path: "/admin/manage-movies", icon: <FaFilm /> },
    { name: "Manage Promotions", path: "/admin/manage-promotions", icon: <FaTags /> },
    { name: "Manage Showtimes", path: "/admin/manage-showtimes", icon: <FaClock /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <nav className="w-64 bg-gray-800 text-white flex flex-col p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">🎬 Admin</h1>
          <p className="text-sm text-gray-300 text-center">Dashboard</p>
        </div>

        <div className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 py-2 px-3 rounded transition-colors ${
                location.pathname === item.path
                  ? "bg-gray-700 text-white font-semibold"
                  : "hover:bg-gray-700 text-gray-200"
              }`}
            >
              {item.icon} {item.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
