"use client";

import { useState, useEffect } from "react";
import { FiArrowLeft, FiSave } from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api";

interface Branch {
  _id: string;
  name: string;
}

export default function AddCategoryPage() {
  const router = useRouter();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userBranch, setUserBranch] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    branch: "",
    status: "Active",
  });

  const [loading, setLoading] = useState(false);

  // Fetch user role and branch
  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const userData = localStorage.getItem("userData");
    setUserRole(role);
    
    if (userData) {
      const user = JSON.parse(userData);
      setUserBranch(user.branch);
      // Auto-select user's branch if they're a BranchManager or Employee
      if ((role === "BranchManager" || role === "Employee") && user.branch) {
        setForm(prev => ({ ...prev, branch: user.branch }));
      }
    }
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.branch) {
      alert("❌ Please select a branch");
      return;
    }

    try {
      setLoading(true);

      await apiClient.post("/categories/create", form);
      alert("✅ Category Created Successfully");
      router.push("/dashboard/categories");
    } catch (error) {
      alert((error as Error).message || "❌ Server Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-white">Add Category</h1>

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
              value={form.branch}
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

        {/* Name */}
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
            rows={3}
            className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-60"
        >
          <FiSave size={18} />
          {loading ? "Saving..." : "Save Category"}
        </button>
      </form>
    </div>
  );
}
