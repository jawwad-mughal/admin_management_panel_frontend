"use client";

import { useState, useEffect } from "react";
import { FiArrowLeft, FiSave } from "react-icons/fi";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import apiClient from "@/lib/api";

interface IBranch {
  _id: string;
  name: string;
  code: string;
  address: string;
  city?: string;
  country?: string;
  phone: string;
  email?: string;
  status: "Active" | "Inactive";
}

export default function EditBranchPage() {
  const router = useRouter();
  const params = useParams();
  const branchId = params?.id;

  const [form, setForm] = useState<IBranch>({
    _id: "",
    name: "",
    code: "",
    address: "",
    city: "",
    country: "",
    phone: "",
    email: "",
    status: "Active",
  });

  const [loading, setLoading] = useState(true);

  // Fetch branch data
  const fetchBranch = async () => {
    try {
      const data = await apiClient.get(`/branches/${branchId}`);
      if (data.success) {
        setForm(data.data);
      }
    } catch (error) {
      alert("Error fetching branch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (branchId) fetchBranch();
  }, [branchId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!form.name || !form.code || !form.address || !form.phone) {
      alert("Required fields missing");
      setLoading(false);
      return;
    }

    try {
      await apiClient.put(`/branches/${branchId}`, form);
      alert("Branch Updated ✅");
      router.push("/maindashboard/branches");
    } catch (error) {
      alert("Error: " + ((error as Error).message || "Update failed"));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-md mx-auto p-1 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-white">Edit Branch</h1>
        <Link
          href="/dashboard/branches"
          className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <FiArrowLeft />
          Back
        </Link>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-6"
      >
        {/* Branch Name */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Branch Name *
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter branch name"
            className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Branch Code */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Branch Code *
          </label>
          <input
            type="text"
            name="code"
            value={form.code}
            onChange={handleChange}
            placeholder="Enter branch code"
            className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Address *
          </label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Enter address"
            className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* City & Country */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              City
            </label>
            <input
              type="text"
              name="city"
              value={form.city || ""}
              onChange={handleChange}
              placeholder="Enter city"
              className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Country
            </label>
            <input
              type="text"
              name="country"
              value={form.country || ""}
              onChange={handleChange}
              placeholder="Enter country"
              className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Phone & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Phone *
            </label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter phone"
              className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email || ""}
              onChange={handleChange}
              placeholder="Enter email"
              className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 w-full justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg disabled:opacity-50"
        >
          <FiSave />
          {loading ? "Updating..." : "Update Branch"}
        </button>
      </form>
    </div>
  );
}
