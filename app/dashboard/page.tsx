"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingCard } from "@/components/Loading";
import { useCheckAccess } from "@/lib/usePermission";
import apiClient from "@/lib/api";
import { ResponsiveContainer } from "recharts";
import { LineChart } from "recharts";
import { Tooltip } from "recharts";
import { PieChart } from "recharts";
import { Pie } from "recharts";
import { Cell } from "recharts";
import Link from "next/link";
import { CartesianGrid, Line, XAxis, YAxis } from "recharts";

export default function DashboardPage() {
  const router = useRouter();
  const { hasAccess, loading: roleLoading } = useCheckAccess(["Admin"]);
  const [authChecked, setAuthChecked] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [userId, setUserId] = useState<string | null>(null); // Track current user
  const [stats, setStats] = useState({
    users: 0,
    orders: 0,
    products: 0,
    branches: 0,
    revenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [orderStatusData, setOrderStatusData] = useState<any[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await apiClient.get("/auth/verifytoken");
        setAuthChecked(true);
      } catch {
        router.replace("/login");
      }
    };

    checkAuth();
  }, [router]);

  // Get current user ID
  useEffect(() => {
    const getUserId = async () => {
      try {
        const response = await apiClient.get("/users/profile");
        if (response?._id) {
          setUserId(response._id);
        }
      } catch (error) {
        console.error("Failed to get user ID:", error);
      }
    };

    if (authChecked) {
      getUserId();
    }
  }, [authChecked]);

  // Redirect non-admins
  useEffect(() => {
    if (!roleLoading && !hasAccess) {
      router.replace("/dashboard");
    }
  }, [roleLoading, hasAccess, router]);

  useEffect(() => {
    if (!authChecked || !hasAccess || !userId) return;

    const loadStats = async () => {
      try {
        setLoadingStats(true); // Reset loading state

        console.log("📊 Loading dashboard stats for user:", userId);

        const users = await apiClient.get("/users/getall");
        const productsResult = await apiClient.get("/products/all");
        const branchesResult = await apiClient.get("/branches/all");
        const reportsResult = await apiClient.get("/reports");

        const totalUsers = Array.isArray(users) ? users.length : 0;
        const totalProducts = productsResult?.data ? productsResult.data.length : 0;
        const totalBranches = branchesResult?.data ? branchesResult.data.length : 0;
        const totalOrders = reportsResult?.data?.totalOrders ?? 0;
        const totalRevenue = reportsResult?.data?.totalRevenue ?? 0;

        console.log("📊 Stats loaded - Users:", totalUsers, "Products:", totalProducts, "Orders:", totalOrders);

        setStats({
          users: totalUsers,
          orders: totalOrders,
          products: totalProducts,
          branches: totalBranches,
          revenue: totalRevenue,
        });

        const topOrders = (reportsResult?.data?.orders || []).slice(0, 5);
        setRecentOrders(topOrders);

        const chart = reportsResult?.data?.chartData || [];
        setChartData(chart);

        const statusData = [
          { name: 'Pending', value: reportsResult?.data?.pending || 0, color: '#fbbf24' },
          { name: 'Processing', value: reportsResult?.data?.processing || 0, color: '#a855f7' },
          { name: 'Shipped', value: reportsResult?.data?.shipped || 0, color: '#3b82f6' },
          { name: 'Delivered', value: reportsResult?.data?.delivered || 0, color: '#10b981' },
          { name: 'Cancelled', value: reportsResult?.data?.cancelled || 0, color: '#ef4444' },
        ];
        setOrderStatusData(statusData);
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      } finally {
        setLoadingStats(false);
      }
    };

    loadStats();
  }, [authChecked, hasAccess, userId]);

  if (roleLoading || !authChecked || loadingStats) {
    return <LoadingCard message="Loading dashboard..." className="h-[70vh]" />;
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <p className="text-red-600 dark:text-red-300">
          Access denied. Admin only.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Overview of your management system
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/settings"
            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium rounded-full transition-colors"
          >
            ⚙️ Settings
          </Link>
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-medium rounded-full">
            Live Data
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          title="Total Users"
          value={String(stats.users ?? 0)}
          change="+12% from last month"
          color="blue"
          icon="👥"
        />
        <Card
          title="Total Branches"
          value={String(stats.branches ?? 0)}
          change="+7% from last month"
          color="emerald"
          icon="🏢"
        />
        <Card
          title="Total Orders"
          value={String(stats.orders ?? 0)}
          change="+8% from last month"
          color="green"
          icon="📦"
        />
        <Card
          title="Products"
          value={String(stats.products ?? 0)}
          change="+5% from last month"
          color="purple"
          icon="🛍️"
        />
        <Card
          title="Revenue"
          value={`$${stats.revenue.toLocaleString()}`}
          change="+15% from last month"
          color="emerald"
          icon="💰"
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
            <LineChart data={chartData}>
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
                data={orderStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {orderStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
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
          <Link
            href="/dashboard/orders"
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            View all →
          </Link>
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
              {recentOrders.length === 0 ? (
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
              ) : (
                recentOrders.map((order: any) => {
                  const orderStatus = order.status || "Pending";
                  const statusConfig = {
                    Pending: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400", icon: "⏳" },
                    Processing: { color: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400", icon: "⚙️" },
                    Shipped: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400", icon: "🚚" },
                    Delivered: { color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400", icon: "✅" },
                    Cancelled: { color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400", icon: "❌" },
                  };
                  const status = statusConfig[orderStatus as keyof typeof statusConfig] || statusConfig.Pending;

                  return (
                    <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm text-gray-900 dark:text-white">
                          #{order._id.slice(-8)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-linear-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center mr-3">
                            <span className="text-xs font-medium text-white">
                              {(order.customerName || order.user?.name || "U")[0].toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm text-gray-900 dark:text-white">
                            {order.customerName || order.user?.name || "Unknown"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          ${order.totalAmount?.toFixed(2) ?? 0}
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
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

type CardColor = "blue" | "green" | "purple" | "emerald";

interface CardProps {
  title: string;
  value: string;
  change: string;
  color: CardColor;
  icon: React.ReactNode;
}

function Card({ title, value, change, color, icon }: CardProps) {
  const colorClasses: Record<CardColor, string> = {
    blue: "bg-gradient-to-br from-blue-500 to-blue-600",
    green: "bg-gradient-to-br from-green-500 to-green-600",
    purple: "bg-gradient-to-br from-purple-500 to-purple-600",
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
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {change}
          </p>
        </div>
        <div className={`w-12 h-12 ${colorClasses[color]} rounded-xl flex items-center justify-center shadow-lg`}>
          <span className="text-xl">{icon}</span>
        </div>
      </div>
    </div>
  );
}
