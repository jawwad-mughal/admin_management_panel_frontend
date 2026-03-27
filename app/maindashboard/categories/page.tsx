"use client";

import { useState, useEffect } from "react";
import { FiSearch, FiPlus, FiEdit, FiTrash2, FiGrid } from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api";

interface ICategory {
  _id: string;
  name: string;
  description: string;
  status: "Active" | "Inactive";
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [search, setSearch] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  const statusColors: Record<string, string> = {
    Active: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    Inactive: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  };

  // Detect mobile screen
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const data = await apiClient.get("/categories/all");
      if (data.success) setCategories(data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await apiClient.delete(`/categories/${id}`);
      setCategories(categories.filter((cat) => cat._id !== id));
      alert("Category deleted ✅");
    } catch (error) {
      alert("Error: " + ((error as Error).message || "Delete failed"));
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold dark:text-white">Categories Management</h1>

        <div className="flex gap-3">
          <Link
            href="/maindashboard/products"
            className="relative group flex items-center justify-center gap-2 bg-blue-600 text-white px-2 py-2 rounded-lg hover:bg-blue-700"
          >
            <FiGrid size={20} />
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition duration-200 whitespace-nowrap">
              Products Dashboard
            </span>
          </Link>

          <Link
            href="/maindashboard/categories/create"
            className="relative group flex items-center justify-center gap-2 bg-blue-600 text-white px-2 py-2 rounded-lg hover:bg-blue-700"
          >
            <FiPlus size={20} />
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition duration-200 whitespace-nowrap">
              Add Category
            </span>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard title="Total Categories" value={categories.length} />
        <StatCard
          title="Active Categories"
          value={categories.filter((c) => c.status === "Active").length}
        />
        <StatCard
          title="Inactive Categories"
          value={categories.filter((c) => c.status === "Inactive").length}
        />
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
        <FiSearch className="text-gray-400" />
        <input
          type="text"
          placeholder="Search category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent outline-none dark:text-white"
        />
      </div>

      {/* Categories List */}
      {isMobile ? (
        // Mobile Card Layout
        <div className="space-y-3">
          {filteredCategories.map((cat) => (
            <div
              key={cat._id}
              className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-center mb-2">
                <p className="font-medium dark:text-white">{cat.name}</p>
                <span className={`${statusColors[cat.status]} px-2 py-1 rounded-full text-xs`}>
                  {cat.status}
                </span>
              </div>
              <p className="text-sm dark:text-gray-300">{cat.description}</p>
              <div className="flex gap-4 mt-2">
                <button
                  onClick={() => router.push(`/maindashboard/categories/edit/${cat._id}`)}
                  className="text-blue-500 hover:text-blue-700"
                  title="Edit Category"
                >
                  <FiEdit />
                </button>
                <button
                  onClick={() => handleDelete(cat._id)}
                  className="text-red-500 hover:text-red-700"
                  title="Delete Category"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
          {filteredCategories.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400">No categories found</p>
          )}
        </div>
      ) : (
        // Desktop Table Layout
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3">Category Name</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((cat) => (
                <tr
                  key={cat._id}
                  className="border-t hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 font-medium dark:text-white">{cat.name}</td>
                  <td className="px-6 py-4 dark:text-gray-300">{cat.description}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`${statusColors[cat.status]} px-3 py-1 rounded-full text-xs`}
                    >
                      {cat.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-4">
                    <button
                      onClick={() => router.push(`/dashboard/categories/edit/${cat._id}`)}
                      className="text-blue-500 hover:text-blue-700"
                      title="Edit Category"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete Category"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
      <p className="text-gray-500 dark:text-gray-400 text-sm">{title}</p>
      <h2 className="text-3xl font-bold dark:text-white mt-2">{value}</h2>
    </div>
  );
}
