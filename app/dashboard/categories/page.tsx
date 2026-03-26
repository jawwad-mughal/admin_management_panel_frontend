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
  
  const router = useRouter();

  const statusColors: any = {
    Active: "bg-green-100 text-green-600",
    Inactive: "bg-red-100 text-red-600",
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const data = await apiClient.get("/categories/all");
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Filtered categories by search
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase()),
  );

  // Delete category
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
    <div className="space-y-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold dark:text-white">
          Categories Management
        </h1>

        <div className="flex gap-3">
          {/* Products Dashboard Button */}
          <div className="relative group inline-block rounded-lg">
            <Link
              href="/dashboard/products"
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-2 py-2 rounded-lg hover:bg-blue-700"
            >
              <FiGrid size={20} />
            </Link>

            {/* Tooltip */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-7 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
              <div className="bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                Products Dashboard
              </div>
            </div>
          </div>
          
          {/* Add Category Button - Only for Admin/BranchManager */}
        
            <div className="relative group inline-block">
              <Link
                href="/dashboard/categories/create"
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-2 py-2 rounded-lg hover:bg-blue-700"
              >
                <FiPlus size={20} />
              </Link>

              {/* Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 -top-7 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                <div className="bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  Add Category
                </div>
              </div>
            </div>

        </div>
      </div>

      {/* Stats Cards */}
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



      {/* Categories Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
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
                  <td className="px-6 py-4 font-medium dark:text-white">
                    {cat.name}
                  </td>
                  <td className="px-6 py-4 dark:text-gray-300">
                    {cat.description}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`${statusColors[cat.status]} px-3 py-1 rounded-full text-xs`}
                    >
                      {cat.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-4">
                    {/* Edit - Only for Admin/BranchManager */}
              
                      <button
                        className="text-blue-500 hover:text-blue-700"
                        onClick={() =>
                          router.push(`/dashboard/categories/edit/${cat._id}`)
                        }
                        title="Edit Category"
                      >
                        <FiEdit />
                      </button>
              

                    {/* Delete - Only for Admin/BranchManager */}
      
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(cat._id)}
                        title="Delete Category"
                      >
                        <FiTrash2 />
                      </button>
                  
                  </td>
                </tr>
              ))}

              {filteredCategories.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-4 text-gray-500 dark:text-gray-400"
                  >
                    No categories found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
      <p className="text-gray-500 dark:text-gray-400 text-sm">{title}</p>
      <h2 className="text-3xl font-bold dark:text-white mt-2">{value}</h2>
    </div>
  );
}
