"use client";

import { useState, useEffect } from "react";
import { FiSave, FiArrowLeft } from "react-icons/fi";
import Link from "next/link";
import apiClient from "@/lib/api";

interface ICategory {
  _id: string;
  name: string;
}

export default function CreateProductPage() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    status: "Active",
    image: null as File | null,
  });

  const [loading, setLoading] = useState(false);

  // Fetch categories for select dropdown
  useEffect(() => {
    apiClient
      .get("/categories/all")
      .then((data) => {
        if (data.success) setCategories(data.data);
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, files } = e.target as any;
    if (name === "image" && files) {
      setForm({ ...form, image: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("category", form.category);
      formData.append("price", form.price);
      formData.append("stock", form.stock);
      formData.append("status", form.status);
      if (form.image) formData.append("image", form.image);

      await apiClient.post("/products/create", formData);
      alert("Product created successfully!");
      // Reset form
      setForm({
        name: "",
        category: "",
        price: "",
        stock: "",
        status: "Active",
        image: null,
      });
    } catch (error) {
      alert("Error: " + ((error as Error).message || "Failed to create product"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4 p-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-white">Add Product</h1>
        <Link
          href="/dashboard/products"
          className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <FiArrowLeft />
          Back
        </Link>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow space-y-6"
      >
        {/* Product Name */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Product Name
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter product name"
            className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Category
          </label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price & Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Price (Rs)
            </label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="0"
              className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Stock
            </label>
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              placeholder="0"
              className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              required
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

        {/* Image Upload */}
        <div className="m-0">
          <label className="block text-gray-700 dark:text-gray-300">
            Product Image
          </label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            className="w-full text-gray-700 dark:text-gray-200"
          />
          {form.image && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Selected file: {form.image.name}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`flex items-center gap-2 py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all duration-200 cursor-pointer ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <FiSave size={18} />
          {loading ? "Saving..." : "Save Product"}
        </button>
      </form>
    </div>
  );
}
