"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import apiClient from "@/lib/api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams(); // SSR-safe

  const [token, setToken] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Toggle for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Client-side token initialization
  useEffect(() => {
    if (params?.token) {
      const t = Array.isArray(params.token) ? params.token[0] : params.token;
      setToken(t);
    }
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    if (!token) {
      setMessage("Invalid token");
      return;
    }

    setLoading(true);

    try {
      const data = await apiClient.post(
        `/auth/reset-password/${token}`,
        { password }
      );
      setMessage("Password reset successful! Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setMessage(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    // Token not ready yet — show loading
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>

        {/* Password Field */}
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {/* Confirm Password Field */}
        <div className="relative mb-4">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {showConfirmPassword ? "Hide" : "Show"}
          </button>
        </div>

        {message && (
          <p className="text-center text-sm text-red-500 mb-4">{message}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        <p className="text-center text-sm mt-4">
          Remember your password?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}