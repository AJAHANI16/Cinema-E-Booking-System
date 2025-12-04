// src/pages/admin/AdminPage.tsx
import React from "react";
import { Link } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";

const AdminPage: React.FC = () => {
  const addItems = [
    { name: "Add Movie", path: "/admin/add-movie" },
    { name: "Add Promotion", path: "/admin/add-promotion" },
    { name: "Add Showtime", path: "/admin/add-showtime" },
  ];

  const manageItems = [
    { name: "Manage Users", path: "/admin/manage-users" },
    { name: "Manage Movies", path: "/admin/manage-movies" },
    { name: "Manage Promotions", path: "/admin/manage-promotions" },
    { name: "Manage Showtimes", path: "/admin/manage-showtimes" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />

      <div className="max-w-5xl mx-auto mt-10">
        <h1 className="text-3xl font-bold mb-8 text-center">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Add Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Add</h2>
            <div className="flex flex-col gap-3">
              {addItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition text-center"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Manage Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Manage</h2>
            <div className="flex flex-col gap-3">
              {manageItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="block bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-700 transition text-center"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
