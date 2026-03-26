"use client";

import { useEffect, useState } from "react";
import { FiSearch, FiEye, FiTrash2 } from "react-icons/fi";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api";

interface IOrder {
  _id: string;
  customerName: string;
  phone: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<IOrder[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Fetch orders from backend
  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiClient.get("/orders/all");
      if (data.success) {
        setOrders(data.data);
      } else {
        setError("Failed to fetch orders");
      }
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
    const confirmDelete = confirm(
      "Are you sure you want to delete this order?",
    );
    if (!confirmDelete) return;

    try {
      await apiClient.delete(`/orders/delete/${id}`);
      alert("Order deleted successfully");
      fetchOrders(); // 🔥 refresh list
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Filter logic
  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o._id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.phone.includes(search);

    const matchStatus = statusFilter === "All" || o.status === statusFilter;

    return matchSearch && matchStatus;
  });

  // ✅ Stats dynamically
  const statusCounts = orders.reduce(
    (acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <h1 className="text-2xl font-bold dark:text-white">
        Orders Management
      </h1>

      <div className="flex gap-3">
        <button
          onClick={() => router.push("/dashboard/orders/create")}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          + Create Order
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
    {loading && (
      <p className="text-center text-gray-500">Loading orders...</p>
    )}
    {error && <p className="text-center text-red-500">{error}</p>}

    {/* Table */}
    {!loading && !error && (
      <div className="bg-white dark:bg-gray-800 shadow rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr className="text-left">
                <th className="p-3">Order ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Total</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((o) => (
                  <tr
                    key={o._id}
                    className="border-t hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="p-3 font-semibold">{o._id.slice(-6)}</td>
                    <td className="p-3">{o.customerName}</td>
                    <td className="p-3">{o.phone}</td>
                    <td className="p-3">Rs {o.totalAmount}</td>
                    <td className="p-3">{o.paymentMethod}</td>
                    <td className="p-3">{o.status}</td>
                    <td className="p-3">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 flex gap-3">
                      <button
                        onClick={() =>
                          router.push(`/dashboard/orders/details/${o._id}`)
                        }
                        className="text-blue-600"
                      >
                        <FiEye />
                      </button>
                      <button
                        onClick={() => deleteOrder(o._id)}
                        className="text-red-600"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center p-6 text-gray-500">
                    No Orders Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
);
};

// Stats Card Component
function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
      <p className="text-gray-500 dark:text-gray-400 text-sm">{title}</p>
      <h2 className="text-2xl font-bold dark:text-white mt-1">{value}</h2>
    </div>
  );
};
