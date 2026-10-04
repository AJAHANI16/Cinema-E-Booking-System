// src/pages/admin/ManageShowtimesPage.tsx
import React, { useEffect, useState } from "react";
import AdminNavbar from "./AdminNavbar";
import http, { extractErrorMessage } from "../../data/http";

interface ShowtimeRow {
  id: number;
  movieTitle: string;
  movieRoomName: string;
  startsAt: string;
  format: string;
  basePrice: number;
}

const ManageShowtimesPage: React.FC = () => {
  const [showtimes, setShowtimes] = useState<ShowtimeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingShowtime, setEditingShowtime] = useState<ShowtimeRow | null>(null);
  const [saving, setSaving] = useState(false);

  const formatDateTime = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
  };

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

  const fetchShowtimes = async () => {
    try {
      const [showtimesRes, movieRoomsRes] = await Promise.all([
        http.get<
          Array<{
            id: number;
            movie: number;
            movie_room: number;
            starts_at: string;
            format: string;
            base_price: string;
            movie_title?: string;
          }>
        >("/admin/showtimes/"),
        http.get<
          Array<{
            id: number;
            name: string;
          }>
        >("/admin/movie-rooms/"),
      ]);

      const movieRoomMap = new Map<number, string>();
      movieRoomsRes.data.forEach((room) => {
        movieRoomMap.set(room.id, room.name);
      });

      const normalized = showtimesRes.data
        .map((showtime) => ({
          id: showtime.id,
          movieTitle: showtime.movie_title ?? `Movie #${showtime.movie}`,
          movieRoomName:
            movieRoomMap.get(showtime.movie_room) ?? `Room ${showtime.movie_room}`,
          startsAt: showtime.starts_at,
          format: showtime.format,
          basePrice: Number(showtime.base_price),
        }))
        .sort(
        (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
        );

      setShowtimes(normalized);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching showtimes:", err);
      setError(extractErrorMessage(err));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShowtimes();
  }, []);

  const deleteShowtime = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this showtime?")) return;

    try {
      await http.delete(`/admin/showtimes/${id}/`);
      setShowtimes((prev) => prev.filter((s) => s.id !== id));
      setError(null);
    } catch (err) {
      console.error("Error deleting showtime:", err);
      setError(extractErrorMessage(err));
    }
  };

  const startEdit = (showtime: ShowtimeRow) => {
    setEditingShowtime({ ...showtime });
    setError(null);
  };

  const toDateTimeLocal = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShowtime) return;

    if (!editingShowtime.startsAt) {
      setError("Start time is required.");
      return;
    }

    if (!Number.isFinite(editingShowtime.basePrice) || editingShowtime.basePrice <= 0) {
      setError("Base price must be greater than 0.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload: Record<string, unknown> = {
        format: editingShowtime.format,
        base_price: editingShowtime.basePrice,
      };

      if (editingShowtime.startsAt) {
        payload["starts_at"] = editingShowtime.startsAt;
      }

      await http.patch(`/admin/showtimes/${editingShowtime.id}/`, payload);

      setShowtimes((prev) =>
        prev.map((s) => (s.id === editingShowtime.id ? { ...editingShowtime } : s))
      );
      setEditingShowtime(null);
    } catch (err) {
      console.error("Error updating showtime:", err);
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
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
          ) : error ? (
            <p className="p-4 text-center text-red-600">{error}</p>
          ) : showtimes.length === 0 ? (
            <p className="p-4 text-center text-gray-600">No showtimes found.</p>
          ) : (
            <table className="min-w-full table-auto">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Movie</th>
                  <th className="px-4 py-2 text-left">Auditorium</th>
                  <th className="px-4 py-2 text-left">Starts At</th>
                  <th className="px-4 py-2 text-left">Format</th>
                  <th className="px-4 py-2 text-left">Base Price</th>
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
                    <td className="border px-4 py-2">{s.movieRoomName}</td>
                    <td className="border px-4 py-2">{formatDateTime(s.startsAt)}</td>
                    <td className="border px-4 py-2">{s.format}</td>
                    <td className="border px-4 py-2">{currencyFormatter.format(s.basePrice)}</td>
                    <td className="border px-4 py-2 flex gap-2">
                      <button
                        onClick={() => deleteShowtime(s.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => startEdit(s)}
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

        {editingShowtime && (
          <div className="mt-8 bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              Edit Showtime (ID: {editingShowtime.id})
            </h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block font-medium mb-1">Starts At</label>
                <input
                  type="datetime-local"
                  value={toDateTimeLocal(editingShowtime.startsAt)}
                  onChange={(e) =>
                    setEditingShowtime((prev) =>
                      prev ? { ...prev, startsAt: e.target.value } : prev
                    )
                  }
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Format</label>
                <select
                  value={editingShowtime.format}
                  onChange={(e) =>
                    setEditingShowtime((prev) =>
                      prev ? { ...prev, format: e.target.value } : prev
                    )
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="2D">2D</option>
                  <option value="3D">3D</option>
                  <option value="IMAX">IMAX</option>
                  <option value="DOLBY">Dolby Cinema</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Base Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingShowtime.basePrice}
                  onChange={(e) =>
                    setEditingShowtime((prev) =>
                      prev
                        ? {
                            ...prev,
                            basePrice:
                              e.target.value === ""
                                ? 0
                                : Number(e.target.value),
                          }
                        : prev
                    )
                  }
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingShowtime(null)}
                  className="px-6 py-2 bg-gray-300 text-gray-800 font-semibold rounded hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageShowtimesPage;
