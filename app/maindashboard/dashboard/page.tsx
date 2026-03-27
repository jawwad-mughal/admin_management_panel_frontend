"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingCard } from "@/components/Loading";
import { useCheckAccess } from "@/lib/usePermission";
import apiClient from "@/lib/api";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const { hasAccess, loading: roleLoading } = useCheckAccess(["Admin"]);
  const [authChecked, setAuthChecked] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [stats, setStats] = useState({ users: 0, orders: 0, products: 0, branches: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [orderStatusData, setOrderStatusData] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileTiny, setIsMobileTiny] = useState(false); // 350px screens

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsMobileTiny(window.innerWidth <= 350);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Check auth
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

  // Get user ID
  useEffect(() => {
    const getUserId = async () => {
      try {
        const response = await apiClient.get("/users/profile");
        if (response?._id) setUserId(response._id);
      } catch (error) {
        console.error("Failed to get user ID:", error);
      }
    };
    if (authChecked) getUserId();
  }, [authChecked]);

  // Redirect non-admins
  useEffect(() => {
    if (!roleLoading && !hasAccess) router.replace("/maindashboard");
  }, [roleLoading, hasAccess, router]);

  // Load stats
  useEffect(() => {
    if (!authChecked || !hasAccess || !userId) return;

    const loadStats = async () => {
      try {
        setLoadingStats(true);
        const users = await apiClient.get("/users/getall");
        const productsResult = await apiClient.get("/products/all");
        const branchesResult = await apiClient.get("/branches/all");
        const reportsResult = await apiClient.get("/reports");

        setStats({
          users: Array.isArray(users?.data) ? users.data.length : 0,
          orders: reportsResult?.data?.totalOrders ?? 0,
          products: productsResult?.data?.length ?? 0,
          branches: branchesResult?.data?.length ?? 0,
          revenue: reportsResult?.data?.totalRevenue ?? 0
        });

        setRecentOrders((reportsResult?.data?.orders || []).slice(0, 5));
        setChartData(reportsResult?.data?.chartData || []);

        setOrderStatusData([
          { name: 'Pending', value: reportsResult?.data?.pending || 0, color: '#fbbf24' },
          { name: 'Processing', value: reportsResult?.data?.processing || 0, color: '#a855f7' },
          { name: 'Shipped', value: reportsResult?.data?.shipped || 0, color: '#3b82f6' },
          { name: 'Delivered', value: reportsResult?.data?.delivered || 0, color: '#10b981' },
          { name: 'Cancelled', value: reportsResult?.data?.cancelled || 0, color: '#ef4444' }
        ]);
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      } finally {
        setLoadingStats(false);
      }
    };
    loadStats();
  }, [authChecked, hasAccess, userId]);

  if (roleLoading || !authChecked || loadingStats)
    return <LoadingCard message="Loading dashboard..." className="h-[70vh]" />;

  if (!hasAccess)
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <p className="text-red-600 dark:text-red-300">Access denied. Admin only.</p>
      </div>
    );

  return (
    <div className={"space-y-8"}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Overview of your management system</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/dashboard/settings" className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium rounded-full transition-colors">
            ⚙️ Settings
          </Link>
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-medium rounded-full">
            Live Data
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
        <Card title="Total Users" value={String(stats.users ?? 0)} change="+12% from last month" color="blue" icon="👥" isMobileTiny={isMobileTiny} />
        <Card title="Total Branches" value={String(stats.branches ?? 0)} change="+7% from last month" color="emerald" icon="🏢" isMobileTiny={isMobileTiny} />
        <Card title="Total Orders" value={String(stats.orders ?? 0)} change="+8% from last month" color="green" icon="📦" isMobileTiny={isMobileTiny} />
        <Card title="Products" value={String(stats.products ?? 0)} change="+5% from last month" color="purple" icon="🛍️" isMobileTiny={isMobileTiny} />
        <Card title="Revenue" value={`$${stats.revenue.toLocaleString()}`} change="+15% from last month" color="emerald" icon="💰" isMobileTiny={isMobileTiny} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Line Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Over Time</h2>
          </div>
          <ResponsiveContainer width="100%" height={isMobileTiny ? 140 : isMobile ? 200 : 300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: isMobileTiny ? 10 : 12, fill: '#6b7280' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: isMobileTiny ? 10 : 12, fill: '#6b7280' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }} activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="">
            {!isMobileTiny && <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Order Status Distribution</h2>}
            <div className="flex flex-wrap gap-2">
              {orderStatusData.map(status => (
                <div key={status.name} className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: status.color }}></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{status.name}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={isMobileTiny ? 180 : isMobile ? 200 : 300}>
            <PieChart>
              <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={isMobileTiny ? 30 : 60} outerRadius={isMobileTiny ? 50 : 100} paddingAngle={2} dataKey="value">
                {orderStatusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
          {!isMobileTiny && <Link href="/maindashboard/orders" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">View all →</Link>}
        </div>

        {isMobileTiny ? (
          <div className="space-y-3 p-4">
            {recentOrders.map((order: any) => {
              const statusConfig = {
                Pending: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400", icon: "⏳" },
                Processing: { color: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400", icon: "⚙️" },
                Shipped: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400", icon: "🚚" },
                Delivered: { color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400", icon: "✅" },
                Cancelled: { color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400", icon: "❌" },
              };
              const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.Pending;

              return (
                <div key={order._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 flex flex-col gap-2 border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className="font-mono text-gray-900 dark:text-white">#{order._id.slice(-8)}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-medium ${status.color}`}>
                      {status.icon} {order.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-700 dark:text-gray-300">{order.customerName || order.user?.name || "Unknown"}</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">Amount: ${order.totalAmount?.toFixed(2) ?? 0}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-2 py-2 sm:px-6 sm:py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Order ID</th>
                  <th className="px-2 py-2 sm:px-6 sm:py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                  <th className="px-2 py-2 sm:px-6 sm:py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                  <th className="px-2 py-2 sm:px-6 sm:py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentOrders.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">No orders found</td></tr>
                ) : recentOrders.map((order: any) => {
                  const statusConfig = {
                    Pending: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400", icon: "⏳" },
                    Processing: { color: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400", icon: "⚙️" },
                    Shipped: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400", icon: "🚚" },
                    Delivered: { color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400", icon: "✅" },
                    Cancelled: { color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400", icon: "❌" },
                  };
                  const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.Pending;

                  return (
                    <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-sm">
                      <td className="px-2 py-2 sm:px-6 sm:py-4 font-mono text-gray-900 dark:text-white">#{order._id.slice(-8)}</td>
                      <td className="px-2 py-2 sm:px-6 sm:py-4 flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-400 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-white">{(order.customerName || order.user?.name || "U")[0].toUpperCase()}</span>
                        </div>
                        {order.customerName || order.user?.name || "Unknown"}
                      </td>
                      <td className="px- py-2 sm:px-6 sm:py-4 font-semibold text-gray-900 dark:text-white">${order.totalAmount?.toFixed(2) ?? 0}</td>
                      <td className="px-2 py-2 sm:px-6 sm:py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>{status.icon} {order.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Card Component
type CardColor = "blue" | "green" | "purple" | "emerald";

interface CardProps {
  title: string;
  value: string;
  change: string;
  color: CardColor;
  icon: React.ReactNode;
  isMobileTiny?: boolean;
}

function Card({ title, value, change, color, icon, isMobileTiny }: CardProps) {
  const colorClasses: Record<CardColor, string> = {
    blue: "bg-gradient-to-br from-blue-500 to-blue-600",
    green: "bg-gradient-to-br from-green-500 to-green-600",
    purple: "bg-gradient-to-br from-purple-500 to-purple-600",
    emerald: "bg-gradient-to-br from-emerald-500 to-emerald-600"
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium text-gray-500 dark:text-gray-400 truncate`}>{title}</p>
          <h3 className={`mt-1 font-bold text-gray-900 dark:text-white ${isMobileTiny ? "text-lg" : "text-2xl"}`}>{value}</h3>
          <p className={`mt-1 text-xs text-gray-500 dark:text-gray-400 ${isMobileTiny ? "text-[10px]" : ""}`}>{change}</p>
        </div>
        <div className={`w-12 h-12 ${colorClasses[color]} rounded-xl flex items-center justify-center shadow-lg ${isMobileTiny ? "w-10 h-10 text-lg" : "text-xl"}`}>
          <span>{icon}</span>
        </div>
      </div>
    </div>
  );
}
