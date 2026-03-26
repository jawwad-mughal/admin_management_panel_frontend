"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FiArrowLeft, FiSave } from "react-icons/fi";
import Link from "next/link";
import apiClient from "@/lib/api";

interface ICategory {
  _id: string;
  name: string;
}

export default function EditProduct() {
  const { id } = useParams();
  const router = useRouter();
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    status: "Active",
    image: "",
  });

  const [newImage, setNewImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const fetchProduct = async () => {
    if (!id || typeof id !== 'string') {
      alert("Invalid product ID");
      router.push("/dashboard/products");
      return;
    }

    setFetchLoading(true);
    try {
      const data = await apiClient.get(`/products/${id}`);
      if (data.success) {
        const product = data.data;
        console.log("Fetched product:", product); // Debug log
        
        setForm({
          name: product.name || "",
          category: typeof product.category === 'object' && product.category?._id 
            ? product.category._id 
            : (product.category || ""),
          price: product.price?.toString() || "",
          stock: product.stock?.toString() || "",
          status: product.status || "Active",
          image: product.image || "",
        });
        setPreview(product.image || "");
      } else {
        alert("Failed to fetch product: " + (data.message || "Unknown error"));
        router.push("/dashboard/products");
      }
    } catch (error: any) {
      console.error("Error fetching product:", error);
      const errorMessage = error.message || error.toString();
      alert("Error fetching product: " + errorMessage);

      // redirect only when not found or unauthorized to avoid endless redirect loops
      if (errorMessage.includes("Not found") || errorMessage.includes("Access denied") || errorMessage.includes("Unauthorized")) {
        router.push("/dashboard/products");
      }
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    if (!id || typeof id !== 'string') {
      alert("Invalid product ID");
      router.push("/dashboard/products");
      return;
    }

    // Fetch categories
    apiClient
      .get("/categories/all")
      .then((data) => {
        if (data.success) {
          setCategories(data.data || []);
        } else {
          console.error("Failed to fetch categories:", data.message);
          alert("Error fetching categories");
        }
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
        alert("Error fetching categories");
      });

    // Fetch product
    fetchProduct();
  }, [id]);

  const handleImageChange = (file: File) => {
    setNewImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || typeof id !== 'string') {
      alert("Invalid product ID");
      return;
    }

    // Basic validation
    if (!form.name.trim() || !form.category || !form.price || !form.stock) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("category", form.category);
    formData.append("price", form.price);
    formData.append("stock", form.stock);
    formData.append("status", form.status);
    if (newImage) formData.append("image", newImage);

    try {
      const response = await apiClient.put(`/products/update/${id}`, formData);
      if (response.success) {
        alert("Product Updated ✅");
        router.push("/dashboard/products");
      } else {
        alert("Failed to update product: " + (response.message || "Unknown error"));
      }
    } catch (error: any) {
      console.error("Error updating product:", error);
      alert("Error updating product: " + (error.response?.data?.message || error.message || "Update failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4 p-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-white">Edit Product</h1>
        <Link
          href="/dashboard/products"
          className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <FiArrowLeft />
          Back
        </Link>
      </div>

      {/* Loading State */}
      {fetchLoading ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Loading product...</p>
        </div>
      ) : (
        /* Form */
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow space-y-6"
        >
        {/* Image Preview */}
        {preview && (
          <div className="flex justify-center">
            <img src={preview} className="w-32 h-32 rounded-lg object-cover border" alt="product" />
          </div>
        )}

        {/* Product Name */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2">Product Name</label>
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
          <label className="block text-gray-700 dark:text-gray-300 mb-2">Category</label>
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
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Price (Rs)</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="Enter price"
              className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Stock</label>
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              placeholder="Enter stock quantity"
              className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2">Change Product Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && handleImageChange(e.target.files[0])}
            className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2">Status</label>
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
          {loading ? "Updating..." : "Update Product"}
        </button>
      </form>
      )}
    </div>
  );
}
