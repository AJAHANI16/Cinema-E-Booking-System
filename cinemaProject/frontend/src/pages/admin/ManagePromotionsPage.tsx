// src/pages/admin/ManagePromotionsPage.tsx
import React, { useEffect, useState } from "react";
import AdminNavbar from "./AdminNavbar";
import http, { extractErrorMessage } from "../../data/http";

interface PromotionRow {
  id: number;
  code: string;
  description: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
}

const ManagePromotionsPage: React.FC = () => {
  const [promotions, setPromotions] = useState<PromotionRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const formatDate = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
  };

  const fetchPromotions = async () => {
    try {
      const res = await http.get<
        Array<{
          id: number;
          promo_code: string;
          description: string;
          discount_percent: string;
          start_date: string;
          end_date: string;
        }>
      >("/admin/promotions/");
      const normalized = res.data.map((promo) => ({
        id: promo.id,
        code: promo.promo_code,
        description: promo.description ?? "",
        discountPercent: Number(promo.discount_percent),
        startDate: promo.start_date,
        endDate: promo.end_date,
      }));
      setPromotions(normalized);
      setError(null);
      setFeedback(null);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching promotions:", err);
      setError(extractErrorMessage(err));
      setFeedback(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const deletePromotion = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this promotion?")) return;

    try {
      await http.delete(`/admin/promotions/${id}/`);
      setPromotions((prev) => prev.filter((p) => p.id !== id));
      setFeedback("Promotion deleted successfully.");
      setError(null);
    } catch (err) {
      console.error("Error deleting promotion:", err);
      setError(extractErrorMessage(err));
      setFeedback(null);
    }
  };

  const sendPromotionEmail = async (id: number) => {
    try {
      const res = await http.post<{ status: string }>(
        `/admin/promotions/${id}/send_email/`
      );
      setFeedback(res.data.status);
      setError(null);
    } catch (err) {
      console.error("Error sending promotion email:", err);
      setError(extractErrorMessage(err));
      setFeedback(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />

      <div className="max-w-6xl mx-auto mt-10">
        <h1 className="text-3xl font-bold mb-6 text-center">Manage Promotions</h1>

        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          {feedback && (
            <p className="p-4 text-center text-emerald-600">{feedback}</p>
          )}
          {loading ? (
            <p className="p-4 text-center text-gray-600">Loading promotions...</p>
          ) : error ? (
            <p className="p-4 text-center text-red-600">{error}</p>
          ) : promotions.length === 0 ? (
            <p className="p-4 text-center text-gray-600">No promotions found.</p>
          ) : (
            <table className="min-w-full table-auto">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Code</th>
                  <th className="px-4 py-2 text-left">Description</th>
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
                    <td className="border px-4 py-2">{promo.code}</td>
                    <td className="border px-4 py-2">{promo.description || "-"}</td>
                    <td className="border px-4 py-2">{promo.discountPercent}%</td>
                    <td className="border px-4 py-2">{formatDate(promo.startDate)}</td>
                    <td className="border px-4 py-2">{formatDate(promo.endDate)}</td>
                    <td className="border px-4 py-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => sendPromotionEmail(promo.id)}
                        className="bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700 transition"
                      >
                        Email
                      </button>
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
