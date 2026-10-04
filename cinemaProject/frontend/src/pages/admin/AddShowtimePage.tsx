// src/pages/admin/AddShowtimePage.tsx
import React, { useState, useEffect } from "react";
import AdminNavbar from "./AdminNavbar";
import http, { extractErrorMessage } from "../../data/http";

interface Movie {
  id: number;
  title: string;
}

interface MovieRoom {
  id: number;
  name: string;
}

const AddShowtimePage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovieId, setSelectedMovieId] = useState<number | "">("");
  const [movieRooms, setMovieRooms] = useState<MovieRoom[]>([]);
  const [selectedMovieRoomId, setSelectedMovieRoomId] = useState<number | "">("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [format, setFormat] = useState("2D");
  const [basePrice, setBasePrice] = useState<number | "">(10);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await http.get<Movie[]>("/admin/movies/");
        setMovies(res.data);
      } catch (err) {
        console.error("Error fetching movies:", err);
      }
    };
    const fetchMovieRooms = async () => {
      try {
        const res = await http.get<MovieRoom[]>("/admin/movie-rooms/");
        setMovieRooms(res.data);
      } catch (err) {
        console.error("Error fetching movie rooms:", err);
      }
    };

    fetchMovies();
    fetchMovieRooms();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setMessage(null);
      if (selectedMovieId === "" || selectedMovieRoomId === "") {
        setMessage({ text: "Movie and auditorium are required.", type: "error" });
        return;
      }
      if (!date || !time) {
        setMessage({ text: "Date and time are required.", type: "error" });
        return;
      }
      const normalizedTime = time.length === 5 ? `${time}:00` : time;
      const combinedDateTime = `${date}T${normalizedTime}`;
      const localDateTime = new Date(combinedDateTime);
      if (Number.isNaN(localDateTime.getTime())) {
        setMessage({ text: "Invalid date or time selection.", type: "error" });
        return;
      }
      const priceValue = typeof basePrice === "number" ? basePrice : Number(basePrice);
      if (!Number.isFinite(priceValue) || priceValue < 0) {
        setMessage({ text: "Base price must be zero or greater.", type: "error" });
        return;
      }
      const payload = {
        movie: selectedMovieId,
        movie_room: selectedMovieRoomId,
        starts_at: localDateTime.toISOString(),
        format,
        base_price: priceValue,
      };
      await http.post("/admin/showtimes/", payload);
      setMessage({ text: "Showtime added successfully!", type: "success" });
      setSelectedMovieId("");
      setSelectedMovieRoomId("");
      setDate("");
      setTime("");
      setFormat("2D");
      setBasePrice(10);
    } catch (err) {
      const errorMessage = extractErrorMessage(err);
      console.error("Error adding showtime:", err);
      setMessage({ text: errorMessage, type: "error" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold mb-4 text-center">Add Showtime</h1>

        {message && (
          <div
            className={`mb-4 px-4 py-2 rounded ${
              message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Movie:</label>
            <select
              value={selectedMovieId}
              onChange={(e) =>
                setSelectedMovieId(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a movie</option>
              {movies.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Auditorium:</label>
            <select
              value={selectedMovieRoomId}
              onChange={(e) =>
                setSelectedMovieRoomId(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select an auditorium</option>
              {movieRooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Time:</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Format:</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="2D">2D</option>
              <option value="3D">3D</option>
              <option value="IMAX">IMAX</option>
              <option value="DOLBY">Dolby Cinema</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Base Price:</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={basePrice}
              onChange={(e) =>
                setBasePrice(e.target.value === "" ? "" : Number(e.target.value))
              }
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Add Showtime
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddShowtimePage;
