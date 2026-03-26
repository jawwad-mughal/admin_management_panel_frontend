"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import apiClient from "@/lib/api";

interface IProduct {
  name: string;
  price: number;
  qty: number;
  image?: string;
}

interface IOrder {
  _id: string;
  customerName: string;
  phone: string;
  address: string;
  paymentMethod: string;
  status: string;
  totalAmount: number;
  products: IProduct[];
  createdAt: string;
}

export default function OrderDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<IOrder | null>(null);
  const [status, setStatus] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole"));
  }, []);

  const canUpdate = userRole === "Admin" || userRole === "BranchManager" || userRole === "Employee";

  const fetchOrder = async () => {
    try {
      const data = await apiClient.get(`/orders/${id}`);
      if (data.success) {
        setOrder(data.data);
        setStatus(data.data.status);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async () => {
    try {
      await apiClient.put(`/orders/${id}/status`, { status });
      alert("Status updated successfully!");
      fetchOrder();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, []);

  if (!order) return <p className="p-6 text-gray-500">Loading...</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {/* Header Card */}
      <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-2xl shadow-lg flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Order #{order._id.slice(-6)}</h1>
          <p className="text-sm opacity-80">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        <button
          onClick={() => router.back()}
          className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:scale-105 transition"
        >
          ← Back
        </button>
      </div>

      {/* Customer Card */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">
          Customer Information
        </h2>

        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-gray-500">Name</p>
            <p className="font-semibold dark:text-white">{order.customerName}</p>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-gray-500">Phone</p>
            <p className="font-semibold dark:text-white">{order.phone}</p>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg md:col-span-2">
            <p className="text-gray-500">Address</p>
            <p className="font-semibold dark:text-white">{order.address}</p>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-gray-500">Payment</p>
            <p className="font-semibold dark:text-white">{order.paymentMethod}</p>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-gray-500">Status</p>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold
              ${order.status === "Pending" && "bg-yellow-200 text-yellow-800"}
              ${order.status === "Processing" && "bg-purple-200 text-purple-800"}
              ${order.status === "Shipped" && "bg-blue-200 text-blue-800"}
              ${order.status === "Delivered" && "bg-green-200 text-green-800"}
              ${order.status === "Cancelled" && "bg-red-200 text-red-800"}
            `}>
              {order.status}
            </span>
          </div>
        </div>
      </div>

      {/* Products Card */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">
          Ordered Products
        </h2>

        <div className="grid gap-4">
          {order.products.map((p, i) => (
            <div
              key={i}
              className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-xl"
            >
              <img
                src={p.image || "/no-image.png"}
                className="w-16 h-16 rounded-lg object-cover"
              />

              <div className="flex-1">
                <p className="font-semibold dark:text-white">{p.name}</p>
                <p className="text-sm text-gray-500">
                  Rs {p.price} × {p.qty}
                </p>
              </div>

              <p className="font-bold dark:text-white">
                Rs {p.price * p.qty}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border space-y-4">
        <h2 className="text-lg font-semibold dark:text-white">
          Order Summary
        </h2>

        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>Rs {order.totalAmount}</span>
        </div>

        {/* Update Status */}
        {canUpdate && (
          <div className="flex flex-col md:flex-row gap-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border p-2 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option>Pending</option>
              <option>Processing</option>
              <option>Shipped</option>
              <option>Delivered</option>
              <option>Cancelled</option>
            </select>

            <button
              onClick={updateStatus}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Update Status
            </button>
          </div>
        )}
      </div>
    </div>
  );
}