// src/pages/admin/ManageMoviesPage.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminNavbar from "./AdminNavbar";

interface Movie {
  id: number;
  title: string;
  genre: string;
  rating: string;
  releaseDate?: string;
}

const ManageMoviesPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMovies = async () => {
    try {
      const res = await axios.get<Movie[]>("/api/movies/");
      setMovies(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching movies:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const deleteMovie = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this movie?")) return;

    try {
      await axios.delete(`/api/movies/${id}/`);
      setMovies(movies.filter((movie) => movie.id !== id));
    } catch (err) {
      console.error("Error deleting movie:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />

      <div className="max-w-6xl mx-auto mt-10">
        <h1 className="text-3xl font-bold mb-6 text-center">Manage Movies</h1>

        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          {loading ? (
            <p className="p-4 text-center text-gray-600">Loading movies...</p>
          ) : movies.length === 0 ? (
            <p className="p-4 text-center text-gray-600">No movies found.</p>
          ) : (
            <table className="min-w-full table-auto">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Title</th>
                  <th className="px-4 py-2 text-left">Genre</th>
                  <th className="px-4 py-2 text-left">Rating</th>
                  <th className="px-4 py-2 text-left">Release Date</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {movies.map((movie, idx) => (
                  <tr
                    key={movie.id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="border px-4 py-2">{movie.id}</td>
                    <td className="border px-4 py-2">{movie.title}</td>
                    <td className="border px-4 py-2">{movie.genre}</td>
                    <td className="border px-4 py-2">{movie.rating}</td>
                    <td className="border px-4 py-2">{movie.releaseDate ?? "-"}</td>
                    <td className="border px-4 py-2 flex gap-2">
                      <button
                        onClick={() => deleteMovie(movie.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                      {/* Future: Edit button */}
                      <button
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageMoviesPage;
