"use client";

import { useState, useEffect } from "react";
import { FiSearch, FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import { TbCategoryPlus } from "react-icons/tb";

import Link from "next/link";

import apiClient from "@/lib/api";

interface IProduct {
  _id: string;
  name: string;
  category: { _id: string; name: string } | string;
  price: number;
  stock: number;
  status: "Active" | "Inactive";
  image?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [search, setSearch] = useState("");
  

  const statusColors: Record<string, string> = {
    Active: "bg-green-100 text-green-600",
    Inactive: "bg-red-100 text-red-600",
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;

    try {
      await apiClient.delete(`/products/delete/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      alert("Product deleted ✅");
    } catch (error) {
      alert("Error: " + ((error as Error).message || "Delete failed"));
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const data = await apiClient.get("/products/all");
      if (data.success) setProducts(data.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === "Active").length;
  const inactiveProducts = products.filter(
    (p) => p.status === "Inactive"
  ).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;

  return (
    <div className="space-y-4 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
  <h1 className="text-2xl font-bold dark:text-white">
    Products Management
  </h1>

  <div className="flex items-center gap-3">
    
    {/* Categories Button */}
    <div className="relative group">
      <Link
        href="/dashboard/categories"
        className="flex items-center justify-center p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
      >
        <TbCategoryPlus size={20} />
      </Link>

      {/* Tooltip */}
      <span className="absolute -top-7 left-1/2 -translate-x-1/2 
      bg-black text-white text-xs px-2 py-1 rounded 
      opacity-0 group-hover:opacity-100 transition duration-200 whitespace-nowrap">
        Categories
      </span>
    </div>

    {/* Add Product */}
    
      <div className="relative group">
        <Link
          href="/dashboard/products/create"
          className="flex items-center justify-center p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          <FiPlus size={20} />
        </Link>

        {/* Tooltip */}
        <span className="absolute -top-7 left-1/2 -translate-x-1/2 
        bg-black text-white text-xs px-2 py-1 rounded 
        opacity-0 group-hover:opacity-100 transition duration-200 whitespace-nowrap">
          Add Product
        </span>
      </div>


  </div>
</div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Products" value={totalProducts} />
        <StatCard title="Active Products" value={activeProducts} />
        <StatCard title="Inactive Products" value={inactiveProducts} />
        <StatCard title="Out of Stock" value={outOfStock} />
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
        <FiSearch className="text-gray-400" />
        <input
          type="text"
          placeholder="Search product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent outline-none dark:text-white"
        />
      </div>

      {/* Access Notice */}
      

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Stock</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((p) => (
                <tr
                  key={p._id}
                  className="border-t hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          p.image
                        }
                        className="w-10 h-10 rounded-lg object-cover border"
                        crossOrigin="anonymous"
                      />
                      <p className="font-medium dark:text-white">
                        {p.name}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-4 dark:text-gray-300">
                    {typeof p.category === 'object' ? p.category.name : p.category}
                  </td>

                  <td className="px-6 py-4 dark:text-gray-300">
                    Rs {p.price}
                  </td>

                  <td
                    className={`px-6 py-4 ${
                      p.stock === 0
                        ? "text-red-500 font-semibold"
                        : "dark:text-gray-300"
                    }`}
                  >
                    {p.stock}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`${statusColors[p.status]} px-3 py-1 rounded-full text-xs`}
                    >
                      {p.status}
                    </span>
                  </td>

                  <td className="p-6 flex gap-3">
                    
                      <Link
                        href={`/dashboard/products/edit/${p._id}`}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <FiEdit />
                      </Link>
                    
                  
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FiTrash2 />
                      </button>
                  
                  </td>
                </tr>
              ))}

              {filteredProducts.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-4 text-gray-500 dark:text-gray-400"
                  >
                    No products found
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

// Stats Card
function StatCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
      <p className="text-gray-500 dark:text-gray-400 text-sm">
        {title}
      </p>
      <h2 className="text-3xl font-bold dark:text-white mt-2">
        {value}
      </h2>
    </div>
  );
}
