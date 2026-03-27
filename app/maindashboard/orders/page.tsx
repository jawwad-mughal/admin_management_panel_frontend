"use client";

import { useEffect, useState } from "react";
import { FiSearch, FiEye, FiTrash2, FiPlus } from "react-icons/fi";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api";

interface IOrder {
  _id: string;
  customerName: string;
  phone: string;
  totalAmount: number;
  paymentMethod: string;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  createdAt: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const statusColors: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
    Processing: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    Shipped: "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    Delivered: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    Cancelled: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  };

  // Fetch orders
  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiClient.get("/orders/all");
      if (data.success) setOrders(data.data);
      else setError("Failed to fetch orders");
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const deleteOrder = async (id: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      await apiClient.delete(`/orders/delete/${id}`);
      alert("Order deleted successfully");
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter & Search
  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o._id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.phone.includes(search);
    const matchStatus = statusFilter === "All" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Stats
  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold dark:text-white">Orders Management</h1>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => router.push("/maindashboard/orders/create")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <FiPlus /> Create Order
          </button>

          {/* Search */}
          <div className="flex items-center border rounded-lg px-3 bg-white dark:bg-gray-800">
            <FiSearch className="text-gray-400" />
            <input
              placeholder="Search order..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="p-2 outline-none bg-transparent dark:text-white"
            />
          </div>

          {/* Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white"
          >
            <option>All</option>
            <option>Pending</option>
            <option>Processing</option>
            <option>Shipped</option>
            <option>Delivered</option>
            <option>Cancelled</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Total Orders" value={orders.length} />
        <StatCard title="Pending" value={statusCounts["Pending"] || 0} />
        <StatCard title="Processing" value={statusCounts["Processing"] || 0} />
        <StatCard title="Shipped" value={statusCounts["Shipped"] || 0} />
        <StatCard title="Delivered" value={statusCounts["Delivered"] || 0} />
        <StatCard title="Cancelled" value={statusCounts["Cancelled"] || 0} />
      </div>

      {/* Loading & Error */}
      {loading && <p className="text-center text-gray-500">Loading orders...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((o) => (
            <div key={o._id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-1">
                <p className="font-medium dark:text-white">#{o._id.slice(-6)}</p>
                <span className={`${statusColors[o.status]} px-2 py-1 rounded-full text-xs`}>
                  {o.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                {o.customerName} | {o.phone}
              </p>
              <p className="text-sm font-medium mb-1">Rs {o.totalAmount}</p>
              <p className="text-sm mb-1">{o.paymentMethod}</p>
              <p className="text-xs text-gray-400 mb-2">
                {new Date(o.createdAt).toLocaleDateString()}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/maindashboard/orders/details/${o._id}`)}
                  className="text-blue-600"
                  title="View Order"
                >
                  <FiEye />
                </button>
                <button
                  onClick={() => deleteOrder(o._id)}
                  className="text-red-600"
                  title="Delete Order"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">No orders found.</p>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3">Order ID</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Phone</th>
              <th className="px-6 py-3">Total</th>
              <th className="px-6 py-3">Payment</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((o) => (
              <tr key={o._id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 font-medium dark:text-white">#{o._id.slice(-6)}</td>
                <td className="px-6 py-4">{o.customerName}</td>
                <td className="px-6 py-4">{o.phone}</td>
                <td className="px-6 py-4">Rs {o.totalAmount}</td>
                <td className="px-6 py-4">{o.paymentMethod}</td>
                <td className="px-6 py-4">
                  <span className={`${statusColors[o.status]} px-3 py-1 rounded-full text-xs`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-6 py-4">{new Date(o.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 flex gap-3">
                  <button
                    onClick={() => router.push(`/maindashboard/orders/details/${o._id}`)}
                    className="text-blue-600"
                    title="View Order"
                  >
                    <FiEye />
                  </button>
                  <button
                    onClick={() => deleteOrder(o._id)}
                    className="text-red-600"
                    title="Delete Order"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
      <p className="text-gray-500 dark:text-gray-400 text-sm">{title}</p>
      <h2 className="text-2xl font-bold dark:text-white mt-1">{value}</h2>
    </div>
  );
}

