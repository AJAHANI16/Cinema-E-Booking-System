// src/pages/RegisterPage.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../data/auth";
import Navbar from "../components/Navbar";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirm: "",
    subscribed_to_promotions: true,
  });

  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    if (form.password !== form.password_confirm) {
      setErr("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        username: form.username.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        password: form.password,
        password_confirm: form.password_confirm,
        subscribed_to_promotions: form.subscribed_to_promotions,
      };

      const res = await registerUser(payload);
      setMsg(res.message || "Registration successful. Check your email to verify your account.");

      // Redirect to login after a brief delay
      setTimeout(() => navigate("/login"), 1200);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            Create Account
          </h1>
          <p className="text-center text-gray-500 text-sm mb-6">
            Join Cinema E-Booking and start reserving seats.
          </p>

          {msg && (
            <div className="mb-4 rounded-lg bg-green-50 border border-green-400 text-green-700 p-3 text-sm">
              {msg}
            </div>
          )}
          {err && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-400 text-red-700 p-3 text-sm whitespace-pre-line">
              {err}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                name="username"
                value={form.username}
                onChange={onChange}
                className="mt-1 w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                required
                autoComplete="username"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  name="first_name"
                  value={form.first_name}
                  onChange={onChange}
                  className="mt-1 w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                  autoComplete="given-name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  name="last_name"
                  value={form.last_name}
                  onChange={onChange}
                  className="mt-1 w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                className="mt-1 w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={onChange}
                className="mt-1 w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                required
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                name="password_confirm"
                value={form.password_confirm}
                onChange={onChange}
                className="mt-1 w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                required
                autoComplete="new-password"
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="subscribed_to_promotions"
                checked={form.subscribed_to_promotions}
                onChange={onChange}
              />
              Register for promotions
            </label>

            <button
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg py-2.5 shadow hover:opacity-90 transition"
            >
              {loading ? "Creating account..." : "Register"}
            </button>

            <div className="text-center text-sm mt-4">
              <span className="text-gray-600">Already have an account? </span>
              <Link
                to="/login"
                className="text-blue-600 hover:underline font-medium"
              >
                Log in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}