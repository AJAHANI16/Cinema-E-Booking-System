// src/pages/admin/ManageShowtimesPage.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminNavbar from "./AdminNavbar";

interface Showtime {
  id: number;
  movieTitle: string;
  date: string;
  time: string;
}

const ManageShowtimesPage: React.FC = () => {
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShowtimes = async () => {
    try {
      const res = await axios.get<Showtime[]>("/api/showtimes/");
      setShowtimes(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching showtimes:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShowtimes();
  }, []);

  const deleteShowtime = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this showtime?")) return;

    try {
      await axios.delete(`/api/showtimes/${id}/`);
      setShowtimes(showtimes.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Error deleting showtime:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />

      <div className="max-w-6xl mx-auto mt-10">
        <h1 className="text-3xl font-bold mb-6 text-center">Manage Showtimes</h1>

        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          {loading ? (
            <p className="p-4 text-center text-gray-600">Loading showtimes...</p>
          ) : showtimes.length === 0 ? (
            <p className="p-4 text-center text-gray-600">No showtimes found.</p>
          ) : (
            <table className="min-w-full table-auto">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Movie</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Time</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {showtimes.map((s, idx) => (
                  <tr
                    key={s.id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="border px-4 py-2">{s.id}</td>
                    <td className="border px-4 py-2">{s.movieTitle}</td>
                    <td className="border px-4 py-2">{s.date}</td>
                    <td className="border px-4 py-2">{s.time}</td>
                    <td className="border px-4 py-2 flex gap-2">
                      <button
                        onClick={() => deleteShowtime(s.id)}
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

export default ManageShowtimesPage;
