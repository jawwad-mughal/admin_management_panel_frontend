"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LoadingCard } from "@/components/Loading";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiShoppingCart,
} from "react-icons/fi";
import apiClient from "@/lib/api";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Dashboard() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect small screens
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 350);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    apiClient.get(`/branches/${id}/dashboard`).then((res) => setData(res.data));
  }, [id]);

  if (!data)
    return (
      <LoadingCard message="Loading branch data..." className="h-[70vh]" />
    );

  const pieData = [
    { name: "Pending", value: data.pending || 0, color: "#fbbf24" },
    { name: "Processing", value: data.processing || 0, color: "#a855f7" },
    { name: "Shipped", value: data.shipped || 0, color: "#3b82f6" },
    { name: "Delivered", value: data.delivered || 0, color: "#10b981" },
    { name: "Cancelled", value: data.cancelled || 0, color: "#ef4444" },
  ];

  return (
    <div className="space-y-6 ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Branch Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
            Branch performance and order overview
          </p>
        </div>
        <button
          onClick={() => router.push("/maindashboard/branches")}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm transition-colors duration-200"
        >
          <FiArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title="Total Orders"
          value={data.totalOrders}
          icon={<FiShoppingCart className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Revenue"
          value={`Rs ${data.totalRevenue}`}
          icon={<FiDollarSign className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          title="Pending"
          value={data.pending || 0}
          icon={<FiClock className="w-5 h-5" />}
          color="yellow"
        />
        <StatCard
          title="Delivered"
          value={data.delivered || 0}
          icon={<FiCheckCircle className="w-5 h-5" />}
          color="emerald"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4">
        {/* Revenue Line Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
            Revenue Over Time
          </h2>
          <ResponsiveContainer width="100%" height={isMobile ? 180 : 250}>
            <LineChart data={data.chartData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#6b7280" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#6b7280" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-md font-semibold text-gray-900 dark:text-white mb-2">
            Order Status
          </h2>
          <div className="flex flex-wrap gap-2 mb-2 text-xs text-gray-500 dark:text-gray-400">
            {pieData.map((p) => (
              <div key={p.name} className="flex items-center gap-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: p.color }}
                ></div>
                {p.name}
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={isMobile ? 180 : 250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((p, i) => (
                  <Cell key={i} fill={p.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders Cards (Mobile-friendly) */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Orders
        </h2>
        {data.orders.length ? (
          data.orders.map((o: any) => {
            const orderStatus = o.status || "Pending";
            const statusConfig = {
              Pending: {
                color:
                  "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
                icon: "⏳",
              },
              Processing: {
                color:
                  "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
                icon: "⚙️",
              },
              Shipped: {
                color:
                  "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
                icon: "🚚",
              },
              Delivered: {
                color:
                  "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
                icon: "✅",
              },
              Cancelled: {
                color:
                  "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
                icon: "❌",
              },
            };
            const status =
              statusConfig[orderStatus as keyof typeof statusConfig] ||
              statusConfig.Pending;

            return (
              <div
                key={o._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-2"
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono text-sm text-gray-900 dark:text-white">
                    #{o._id.slice(-8)}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}
                  >
                    {status.icon} {orderStatus}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                  <span>{o.customerName || "Unknown"}</span>
                  <span>Rs {o.totalAmount}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No orders found
          </div>
        )}
      </div>
    </div>
  );
}

// StatCard Component
function StatCard({
  title,
  value,
  icon,
  color = "blue",
}: {
  title: string;
  value: any;
  icon: any;
  color?: string;
}) {
  const colorClasses = {
    blue: "bg-gradient-to-br from-blue-500 to-blue-600",
    green: "bg-gradient-to-br from-green-500 to-green-600",
    yellow: "bg-gradient-to-br from-yellow-500 to-yellow-600",
    emerald: "bg-gradient-to-br from-emerald-500 to-emerald-600",
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between hover:shadow-lg transition-all duration-200">
      <div className="flex-1">
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          {title}
        </p>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {value}
        </h3>
      </div>
      <div
        className={`w-10 h-10 ${colorClasses[color as keyof typeof colorClasses]} rounded-xl flex items-center justify-center shadow-lg text-white`}
      >
        {icon}
      </div>
    </div>
  );
}
