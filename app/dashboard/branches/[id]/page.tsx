"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LoadingCard } from "@/components/Loading";
import { FiArrowLeft, FiCheckCircle, FiClock, FiDollarSign, FiShoppingCart } from "react-icons/fi";
import apiClient from "@/lib/api";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, PieChart, Pie, Cell } from "recharts";

export default function Dashboard() {
  const { id } = useParams();
  const router = useRouter(); // 👈 useRouter for navigation
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    apiClient
      .get(`/branches/${id}/dashboard`)
      .then((res) => setData(res.data));
  }, [id]);

  if (!data)
    return <LoadingCard message="Loading branch data..." className="h-[70vh]" />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Branch Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Branch performance and order overview
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Orders"
          value={data.totalOrders}
          icon={<FiShoppingCart className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Revenue"
          value={`Rs ${data.totalRevenue}`}
          icon={<FiDollarSign className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Pending"
          value={data.pending || 0}
          icon={<FiClock className="w-6 h-6" />}
          color="yellow"
        />
        <StatCard
          title="Delivered"
          value={data.delivered || 0}
          icon={<FiCheckCircle className="w-6 h-6" />}
          color="emerald"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Revenue Over Time
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.chartData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Order Status Distribution
            </h2>
            <div className="flex gap-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Pending</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Processing</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Pending', value: data.pending || 0, color: '#fbbf24' },
                  { name: 'Processing', value: data.processing || 0, color: '#a855f7' },
                  { name: 'Shipped', value: data.shipped || 0, color: '#3b82f6' },
                  { name: 'Delivered', value: data.delivered || 0, color: '#10b981' },
                  { name: 'Cancelled', value: data.cancelled || 0, color: '#ef4444' },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {[
                  '#fbbf24',
                  '#a855f7',
                  '#3b82f6',
                  '#10b981',
                  '#ef4444'
                ].map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Recent Orders
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {data.orders.length > 0 ? (
                data.orders.map((o: any) => {
                  const orderStatus = o.status || "Pending";
                  const statusConfig = {
                    Pending: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400", icon: "⏳" },
                    Processing: { color: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400", icon: "⚙️" },
                    Shipped: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400", icon: "🚚" },
                    Delivered: { color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400", icon: "✅" },
                    Cancelled: { color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400", icon: "❌" },
                  };
                  const status = statusConfig[orderStatus as keyof typeof statusConfig] || statusConfig.Pending;

                  return (
                    <tr key={o._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm text-gray-900 dark:text-white">
                          #{o._id.slice(-8)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-linear-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center mr-3">
                            <span className="text-xs font-medium text-white">
                              {(o.customerName || "U")[0].toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm text-gray-900 dark:text-white">
                            {o.customerName || "Unknown"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          Rs {o.totalAmount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          <span>{status.icon}</span>
                          {orderStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-500 dark:text-gray-400">No orders found</p>
                    </div>
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

// 🔥 Stat Card
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
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {value}
          </h3>
        </div>
        <div className={`w-12 h-12 ${colorClasses[color as keyof typeof colorClasses]} rounded-xl flex items-center justify-center shadow-lg text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );
}