// src/pages/admin/AddPromotionPage.tsx
import React, { useState } from "react";
import AdminNavbar from "./AdminNavbar";
import http, { extractErrorMessage } from "../../data/http";

const AddPromotionPage: React.FC = () => {
  const [promoCode, setPromoCode] = useState("");
  const [description, setDescription] = useState("");
  const [discount, setDiscount] = useState<number | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setMessage(null);
      const discountValue =
        typeof discount === "number" ? discount : Number(discount);
      if (!Number.isFinite(discountValue) || discountValue <= 0) {
        setMessage({ text: "Discount must be greater than 0.", type: "error" });
        return;
      }
      if (new Date(startDate) > new Date(endDate)) {
        setMessage({ text: "End date must be after the start date.", type: "error" });
        return;
      }
      const payload = {
        promo_code: promoCode,
        description,
        discount_percent: discountValue,
        start_date: startDate,
        end_date: endDate,
      };
      await http.post("/admin/promotions/", payload);
      setMessage({ text: "Promotion added successfully!", type: "success" });
      // Clear form
      setPromoCode("");
      setDescription("");
      setDiscount("");
      setStartDate("");
      setEndDate("");
    } catch (err) {
      console.error("Error adding promotion:", err);
      setMessage({ text: extractErrorMessage(err), type: "error" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="max-w-lg mx-auto mt-10 bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Add Promotion</h1>
        {message && (
          <p
            className={`mb-4 p-2 rounded text-white ${
              message.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {message.text}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Promo Code:</label>
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Description:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Discount (%):</label>
            <input
              type="number"
              value={discount}
              onChange={(e) =>
                setDiscount(e.target.value === "" ? "" : Number(e.target.value))
              }
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">End Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
          >
            Add Promotion
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPromotionPage;
