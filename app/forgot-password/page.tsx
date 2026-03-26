"use client";

import { useState } from "react";
import Link from "next/link";
import apiClient from "@/lib/api";

export default function ForgotPassword() {

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    setLoading(true);
    setMessage("");
    setSuccess(false);

    try {
      const data = await apiClient.post("/auth/forgot-password", { email });
      setSuccess(true);
      setMessage("Password reset link has been sent to your email.");
      setEmail("");
    } catch (err: any) {
      setSuccess(false);
      setMessage(err.message || "Something went wrong");
    }

    setLoading(false);

  };

  return (

    <div className="flex items-center justify-center min-h-screen bg-gray-100">

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
      >

        <h2 className="text-2xl font-bold text-center mb-6">
          Forgot Password
        </h2>

        <p className="text-sm text-gray-600 mb-6 text-center">
          Enter your email and we will send you a password reset link.
        </p>

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:border-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {message && (
          <p
            className={`text-center text-sm mb-4 ${
              success ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded text-white font-semibold ${
            loading
              ? "bg-gray-400"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        <div className="text-center mt-5">

          <Link
            href="/login"
            className="text-blue-600 hover:underline text-sm"
          >
            Back to Login
          </Link>

        </div>
        
      </form>

    </div>

  );

}