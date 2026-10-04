// src/pages/admin/AddMoviePage.tsx
import React, { useState } from "react";
import AdminNavbar from "./AdminNavbar";
import http, { extractErrorMessage } from "../../data/http";

const AddMoviePage: React.FC = () => {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [rating, setRating] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState<number | "">("");
  const [releaseDate, setReleaseDate] = useState("");
  const [poster, setPoster] = useState("");
  const [trailerId, setTrailerId] = useState("");
  const [category, setCategory] = useState("currently-running");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setMessage(null);
      const durationValue = typeof duration === "number" ? duration : Number(duration);
      if (!Number.isFinite(durationValue) || durationValue <= 0) {
        setMessage({ text: "Duration must be a positive number.", type: "error" });
        return;
      }
      const payload = {
        title,
        genre,
        rating,
        description,
        duration: durationValue,
        release_date: releaseDate || null,
        poster: poster,
        trailerId: trailerId,
        category,
      };
      await http.post("/admin/movies/", payload);
      setMessage({ text: "Movie added successfully!", type: "success" });
      setTitle("");
      setGenre("");
      setRating("");
      setDescription("");
      setDuration("");
      setReleaseDate("");
      setPoster("");
      setTrailerId("");
      setCategory("currently-running");
    } catch (err) {
      console.error("Error adding movie:", err);
      setMessage({ text: extractErrorMessage(err), type: "error" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
        <h1 className="text-2xl font-semibold mb-4">Add Movie</h1>
        {message && (
          <div
            className={`mb-4 p-2 rounded text-white ${
              message.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Genre</label>
            <input
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
              rows={4}
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Rating</label>
            <input
              type="text"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Duration (min)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) =>
                setDuration(e.target.value === "" ? "" : Number(e.target.value))
              }
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Release Date</label>
            <input
              type="date"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Poster URL</label>
            <input
              type="text"
              value={poster}
              onChange={(e) => setPoster(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Trailer ID</label>
            <input
              type="text"
              value={trailerId}
              onChange={(e) => setTrailerId(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="currently-running">Currently Running</option>
              <option value="coming-soon">Coming Soon</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition-colors"
          >
            Add Movie
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMoviePage;
