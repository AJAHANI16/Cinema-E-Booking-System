// src/pages/LoginPage.tsx
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { requestPasswordReset } from "../data/auth";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember_me: false,
  });
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [resetEmail, setResetEmail] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [loading, setLoading] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading(true);
    try {
      await login(form);
      setMsg("Login successful.");
      navigate("/"); // ✅ Redirect user to homepage after successful login
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const onReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading(true);
    try {
      await requestPasswordReset(resetEmail);
      setMsg("If an account exists for this email, a reset link has been sent.");
      setShowReset(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to request password reset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar /> {/* ✅ Navbar now included */}
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            Welcome Back
          </h1>
          <p className="text-center text-gray-500 text-sm mb-6">
            Log in to continue to your account.
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
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                className="mt-1 w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                required
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
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                name="remember_me"
                checked={form.remember_me}
                onChange={onChange}
                className="accent-blue-600"
              />
              Remember me
            </label>

            <button
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg py-2.5 shadow hover:opacity-90 transition"
            >
              {loading ? "Signing in..." : "Log in"}
            </button>

            <div className="flex items-center justify-between text-sm mt-3">
              <button
                type="button"
                className="text-blue-600 hover:underline"
                onClick={() => setShowReset(true)}
              >
                Forgot password?
              </button>
              <Link
                to="/register"
                className="text-blue-600 hover:underline font-medium"
              >
                Create account
              </Link>
            </div>
          </form>

          {showReset && (
            <form onSubmit={onReset} className="mt-6 border-t border-gray-200 pt-4 space-y-3">
              <h2 className="text-sm font-semibold text-gray-700">
                Reset Password
              </h2>
              <input
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <div className="flex gap-2">
                <button
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg px-4 py-2 transition"
                  type="button"
                  onClick={() => setShowReset(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg px-4 py-2 shadow hover:opacity-90 transition"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Link"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}