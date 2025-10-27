import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

function VerifyEmailPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");
  const hasRun = useRef(false); // prevent duplicate requests in dev mode

  useEffect(() => {
    const verifyEmail = async () => {
      if (hasRun.current) return; // skip rerun
      hasRun.current = true;

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/auth/verify-email/${token}/`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        const data = await response.json();

        if (response.ok && data.message) {
          setStatus("success");
          setMessage(data.message);

          // auto redirect after short delay
          setTimeout(() => navigate("/login"), 3000);
        } else if (data.error) {
          setStatus("error");
          setMessage(data.error);
        } else {
          setStatus("error");
          setMessage("Unexpected response from server.");
        }
      } catch (err) {
        console.error("Verification request failed:", err);
        setStatus("error");
        setMessage("Could not verify your email. Please try again later.");
      }
    };

    if (token) verifyEmail();
  }, [token, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Email Verification</h1>
        <p
          className={`text-lg ${
            status === "success"
              ? "text-green-600"
              : status === "error"
              ? "text-red-600"
              : "text-gray-700"
          }`}
        >
          {message}
        </p>

        {status === "success" && (
          <p className="mt-4 text-sm text-gray-500">
            Redirecting you to login...
          </p>
        )}
      </div>
    </div>
  );
}

export default VerifyEmailPage;