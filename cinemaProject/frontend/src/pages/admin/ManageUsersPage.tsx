// src/pages/admin/ManageUsersPage.tsx
import React, { useEffect, useState } from "react";
import AdminNavbar from "./AdminNavbar";
import http, { extractErrorMessage } from "../../data/http";

interface User {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  is_admin?: boolean;
}

const ManageUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await http.get<User[]>("/admin/users/");
      setUsers(res.data);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(extractErrorMessage(err));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await http.delete(`/admin/users/${id}/`);
      setUsers((prev) => prev.filter((user) => user.id !== id));
      setError(null);
    } catch (err) {
      console.error("Error deleting user:", err);
      setError(extractErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />

      <div className="max-w-6xl mx-auto mt-10">
        <h1 className="text-3xl font-bold mb-6 text-center">Manage Users</h1>

        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          {loading ? (
            <p className="p-4 text-center text-gray-600">Loading users...</p>
          ) : error ? (
            <p className="p-4 text-center text-red-600">{error}</p>
          ) : users.length === 0 ? (
            <p className="p-4 text-center text-gray-600">No users found.</p>
          ) : (
            <table className="min-w-full table-auto">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Username</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Staff</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr
                    key={user.id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="border px-4 py-2">{user.id}</td>
                    <td className="border px-4 py-2">{user.username}</td>
                    <td className="border px-4 py-2">{user.email}</td>
                    <td className="border px-4 py-2">{user.is_staff ? "Yes" : "No"}</td>
                    <td className="border px-4 py-2 flex gap-2">
                      <button
                        onClick={() => deleteUser(user.id)}
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

export default ManageUsersPage;
