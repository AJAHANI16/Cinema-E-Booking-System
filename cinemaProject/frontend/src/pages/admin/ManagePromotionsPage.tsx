// src/pages/admin/ManagePromotionsPage.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminNavbar from "./AdminNavbar";

interface Promotion {
  id: number;
  title: string;
  discount: number; // percentage
  startDate: string;
  endDate: string;
}

const ManagePromotionsPage: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPromotions = async () => {
    try {
      const res = await axios.get<Promotion[]>("/api/promotions/");
      setPromotions(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching promotions:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const deletePromotion = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this promotion?")) return;

    try {
      await axios.delete(`/api/promotions/${id}/`);
      setPromotions(promotions.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error deleting promotion:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />

      <div className="max-w-6xl mx-auto mt-10">
        <h1 className="text-3xl font-bold mb-6 text-center">Manage Promotions</h1>

        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          {loading ? (
            <p className="p-4 text-center text-gray-600">Loading promotions...</p>
          ) : promotions.length === 0 ? (
            <p className="p-4 text-center text-gray-600">No promotions found.</p>
          ) : (
            <table className="min-w-full table-auto">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Title</th>
                  <th className="px-4 py-2 text-left">Discount (%)</th>
                  <th className="px-4 py-2 text-left">Start Date</th>
                  <th className="px-4 py-2 text-left">End Date</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {promotions.map((promo, idx) => (
                  <tr
                    key={promo.id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="border px-4 py-2">{promo.id}</td>
                    <td className="border px-4 py-2">{promo.title}</td>
                    <td className="border px-4 py-2">{promo.discount}</td>
                    <td className="border px-4 py-2">{promo.startDate}</td>
                    <td className="border px-4 py-2">{promo.endDate}</td>
                    <td className="border px-4 py-2 flex gap-2">
                      <button
                        onClick={() => deletePromotion(promo.id)}
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

export default ManagePromotionsPage;
