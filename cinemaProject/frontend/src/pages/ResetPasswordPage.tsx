// src/pages/ResetPasswordPage.tsx
import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { resetPassword } from "../data/auth";
import Navbar from "../components/Navbar";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>(); // Get token from URL path

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    if (!token) {
      setErr("Invalid or missing reset token.");
      return;
    }
    if (password !== passwordConfirm) {
      setErr("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(token, password, passwordConfirm);
      setMsg(res.message || "Password reset successfully. Redirecting...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Password reset failed.");
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
            Reset Password
          </h1>
          <p className="text-center text-gray-500 text-sm mb-6">
            Enter a new password for your account.
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

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="mt-1 w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                required
                autoComplete="new-password"
              />
            </div>

            <button
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg py-2.5 shadow hover:opacity-90 transition"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <div className="text-center text-sm mt-4">
              <Link
                to="/login"
                className="text-blue-600 hover:underline font-medium"
              >
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}