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
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);

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

  const startEdit = (user: User) => {
    setEditingUser({ ...user });
    setError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setSaving(true);
      setError(null);

      const payload = {
        email: editingUser.email,
        is_staff: editingUser.is_staff,
      };

      await http.patch(`/admin/users/${editingUser.id}/`, payload);

      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...editingUser } : u))
      );
      setEditingUser(null);
    } catch (err) {
      console.error("Error updating user:", err);
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
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
                      <button
                        onClick={() => startEdit(user)}
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

        {editingUser && (
          <div className="mt-8 bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              Edit User (ID: {editingUser.id})
            </h2>
            <form onSubmit={handleEditSubmit} className="space-y-4 max-w-md">
              <div>
                <label className="block font-medium mb-1">Username</label>
                <input
                  type="text"
                  value={editingUser.username}
                  readOnly
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser((prev) =>
                      prev ? { ...prev, email: e.target.value } : prev
                    )
                  }
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editingUser.is_staff}
                  onChange={(e) =>
                    setEditingUser((prev) =>
                      prev ? { ...prev, is_staff: e.target.checked } : prev
                    )
                  }
                  className="accent-blue-600"
                />
                Staff user (can access admin features)
              </label>

              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
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

export default ManageUsersPage;
