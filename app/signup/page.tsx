"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import apiClient from "@/lib/api";

type Country = {
  name: string;
  dial: string;
  flag: string;
  code: string;
};

export default function SignupPage() {
  const [form, setForm] = useState({
    name: "",
    email: "", // Gmail/email
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  // Fetch countries
  useEffect(() => {
    const fetchCountries = async () => {
      const res = await fetch(
        "https://restcountries.com/v3.1/all?fields=name,idd,flags,cca2"
      );
      const data = await res.json();
      const formatted: Country[] = data.map((c: any) => ({
        name: c.name.common,
        dial: c.idd.root + (c.idd.suffixes?.[0] || ""),
        flag: c.flags.png,
        code: c.cca2,
      }));

      formatted.sort((a, b) => a.name.localeCompare(b.name));
      setCountries(formatted);

      // Default country
      const defaultCountry = formatted.find((c) => c.dial === "+92");
      if (defaultCountry) setSelectedCountry(defaultCountry);
    };
    fetchCountries();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await apiClient.signup({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        countryCode: selectedCountry?.name,
        dialCode: selectedCountry?.dial,
        flag: selectedCountry?.flag,
      });

      if (data.user) {
        // Tokens auto-stored by apiClient
        router.replace("/dashboard");
      } else {
        setError(data.message || "Signup failed");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (value: string) => {
    setForm({ ...form, phone: value });
    const matched = countries.find((c) => value.startsWith(c.dial));
    if (matched) setSelectedCountry(matched);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="p-8 rounded-lg shadow-lg border border-gray-300 w-full max-w-md bg-white"
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Sign up
        </h2>

        {/* Name */}
        <input
          type="text"
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none"
          required
        />

        {/* Gmail */}
        <input
          type="email"
          placeholder="Gmail / Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none"
          required
        />

        {/* Country Selector */}
        <div className="border border-gray-300 rounded-lg mb-4">
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-300">
            <div className="flex-1">
              <p className="text-sm text-gray-400 mb-1">Country/Region</p>
              <select
                value={selectedCountry?.code || ""}
                onChange={(e) => {
                  const country = countries.find((c) => c.code === e.target.value);
                  if (country) {
                    setSelectedCountry(country);
                  }
                }}
                className="w-40 py-2 rounded focus:outline-none"
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.dial})
                  </option>
                ))}
              </select>
            </div>

            {/* Flag */}
            <div className="ml-3">
              {selectedCountry && (
                <Image
                  src={selectedCountry.flag}
                  width={40}
                  height={40}
                  alt="flag"
                  loading="eager"
                  className="rounded-full border border-gray-300 w-10 h-10"
                />
              )}
            </div>
          </div>

          {/* Phone Input */}
          <input
            type="tel"
            placeholder="Phone number"
            value={form.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            className="w-full p-3 focus:outline-none"
            required
          />
        </div>

        {/* Password */}
        <div className="relative w-full mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-600 hover:text-gray-800 focus:outline-none"
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fillRule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM2 10a8.005 8.005 0 0112.595-6.594l-1.42 1.42A6.003 6.003 0 006.414 8.414l-1.42 1.42A7.97 7.97 0 012 10zM16 10a8.005 8.005 0 01-12.595 6.594l1.42-1.42A6.003 6.003 0 0013.586 11.586l1.42-1.42A7.97 7.97 0 0116 10z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Error */}
        {error && <p className="text-red-600 mb-4">{error}</p>}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded font-semibold text-white ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          } transition duration-300`}
        >
          {loading ? "Signing up..." : "Signup"}
        </button>

        <p className="text-center mt-4 text-sm text-gray-700">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}