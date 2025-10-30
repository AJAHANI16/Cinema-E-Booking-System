// src/components/Navbar.tsx
import {Link, useLocation} from "react-router-dom";
import {useAuth} from "../contexts/AuthContext";
import type {Movie} from "../types/Movie";
import {useState} from "react";

interface NavbarProps {
    onSearch?: (query: string) => void;
    onFilter?: (genre: string) => void;
    movies?: Movie[];
}

export default function Navbar({onSearch, onFilter, movies}: NavbarProps) {
    const location = useLocation();
    const {isAuthenticated, user, logout, isLoading} = useAuth();

    const [search, setSearch] = useState("");
    const [genre, setGenre] = useState("");

    const hideNavbar =
        location.pathname === "/login" || location.pathname === "/register";
    if (hideNavbar) return null;

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const genres = movies ? Array.from(new Set(movies.map((m) => m.genre))) : [];

    return (
        <nav
            className="backdrop-blur-md bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 shadow-lg sticky top-0 z-50">
            <div
                className="max-w-7xl mx-auto px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Logo / Site title */}
                <Link
                    to="/"
                    className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 hover:opacity-90 transition"
                >
                    🎬 Cinema<span className="text-white">E</span>Booking
                </Link>

                {/* Search + Filter */}
                {onSearch && onFilter && (
                    <div
                        className="flex flex-wrap items-center gap-3 bg-gray-800/70 px-4 py-2 rounded-lg shadow-inner border border-gray-700">
                        <input
                            type="text"
                            placeholder="Search movies..."
                            value={search}
                            onChange={(e) => {
                                const q = e.target.value;
                                setSearch(q);
                                onSearch(q);
                            }}
                            className="px-3 py-2 text-sm rounded-md bg-gray-900/50 text-gray-100 placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none transition w-48 sm:w-64"
                        />

                        {movies && (
                            <select
                                value={genre}
                                onChange={(e) => {
                                    const g = e.target.value;
                                    setGenre(g);
                                    onFilter(g);
                                }}
                                className="px-3 py-2 text-sm rounded-md bg-gray-900/50 text-gray-100 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                            >
                                <option value="">All Genres</option>
                                {genres.map((g) => (
                                    <option key={g} value={g}>
                                        {g}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                )}

                {/* User controls */}
                <div className="flex items-center gap-5">
                    {isLoading ? (
                        <div className="text-gray-300 animate-pulse">Loading...</div>
                    ) : isAuthenticated && user ? (
                        <>
              <span className="text-gray-200 text-sm sm:text-base">
                Welcome,{" "}
                  <span className="font-semibold text-yellow-400">
                  {user.first_name || user.username}
                </span>
                !
              </span>

                            {user.is_admin && (
                                <Link
                                    to="/admin"
                                    className="text-gray-200 hover:text-green-400 font-medium transition"
                                >
                                    Admin Panel
                                </Link>
                            )}

                            <Link
                                to="/profile"
                                className="text-gray-200 hover:text-yellow-400 transition font-medium"
                            >
                                Profile
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="px-3 py-1.5 rounded-md text-sm font-medium bg-red-600 hover:bg-red-500 transition shadow"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="text-gray-200 hover:text-blue-400 font-medium transition"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="px-4 py-2 rounded-md border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-gray-900 font-semibold shadow transition"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}