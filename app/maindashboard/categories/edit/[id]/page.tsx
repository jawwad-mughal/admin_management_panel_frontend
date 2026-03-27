"use client";

import { useState, useEffect } from "react";
import { FiArrowLeft, FiSave } from "react-icons/fi";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import apiClient from "@/lib/api";

interface Branch {
  _id: string;
  name: string;
}

interface ICategory {
  _id: string;
  name: string;
  description: string;
  branch?: string;
  status: "Active" | "Inactive";
}

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams(); // Next.js 13 route params
  const categoryId = params?.id; // assume route: /dashboard/categories/edit/[id]

  const [form, setForm] = useState<ICategory>({
    _id: "",
    name: "",
    description: "",
    branch: "",
    status: "Active",
  });

  const [branches, setBranches] = useState<Branch[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user role
  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);
  }, []);

  // Fetch branches
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const data = await apiClient.get("/branches/all");
        if (data.success) {
          setBranches(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    };
    fetchBranches();
  }, []);

  // Fetch category data
  const fetchCategory = async () => {
    try {
      const data = await apiClient.get(`/categories/${categoryId}`);
      if (data.success) {
        setForm(data.data);
      }
    } catch (error) {
      console.error("Error fetching category:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (categoryId) fetchCategory();
  }, [categoryId]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await apiClient.put(`/categories/${categoryId}`, form);
      router.push("/maindashboard/categories");
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-white">Edit Category</h1>
        <Link
          href="/maindashboard/categories"
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
        {/* Branch Selection - Only show for Admins */}
        {userRole === "Admin" && (
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Branch <span className="text-red-500">*</span>
            </label>

            <select
              name="branch"
              value={form.branch || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch._id} value={branch._id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Category Name */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Category Name
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter category name"
            className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Enter category description"
            className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
            required
          />
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
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all duration-200 cursor-pointer"
        >
          <FiSave size={18} />
          Update Category
        </button>
      </form>
    </div>
  );
}