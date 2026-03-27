"use client";

import { useEffect, useState } from "react";
import {
  FiDollarSign,
  FiShoppingCart,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiFilter,
  FiSearch,
  FiRefreshCcw,
  FiDownload,
} from "react-icons/fi";
import apiClient from "@/lib/api";

export default function Reports() {
  const [data, setData] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "",
    search: "",
    branch: "",
  });

  const statusColors: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
    Processing: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    Shipped: "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    Delivered: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    Cancelled: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  };

  const fetchBranches = async () => {
    try {
      const json = await apiClient.get("/branches/all");
      setBranches(json.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const query = `?page=${page}&startDate=${filters.startDate}&endDate=${filters.endDate}&status=${filters.status}&search=${filters.search}&branch=${filters.branch}`;
      const json = await apiClient.get(`/reports${query}`);
      setData(json.data);
    } catch (err) {
      setError("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchData();
  }, [page]);

  const setQuickDate = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setFilters({
      ...filters,
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    });
  };

  const exportCSV = () => {
    if (!data?.orders?.length) return;
    const csv = [
      ["Customer", "Amount", "Status"],
      ...data.orders.map((o: any) => [o.customerName, o.totalAmount, o.status]),
    ]
      .map((e) => e.join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reports.csv";
    a.click();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Reports Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-300">Business Insights</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="btn">
            <FiRefreshCcw /> Refresh
          </button>
          <button onClick={exportCSV} className="btn">
            <FiDownload /> Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow space-y-3">
        <div className="flex gap-2 items-center text-gray-600 dark:text-gray-300">
          <FiFilter /> Filters
        </div>
        <div className="grid md:grid-cols-6 gap-2">
          <div>
            <label className="block text-sm mb-1 dark:text-gray-300">Start Date:</label>
          <input type="date" placeholder="StartDate:" className="input" onChange={(e) => setFilters({...filters, startDate: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm mb-1 dark:text-gray-300">End Date:</label>
            <input type="date" placeholder="EndDate:" className="input" onChange={(e) => setFilters({...filters, endDate: e.target.value})} />
          </div>
          <select className="input" onChange={(e) => setFilters({...filters, branch: e.target.value})}>
            <option value="">All Branches</option>
            {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
          </select>
          <select className="input" onChange={(e) => setFilters({...filters, status: e.target.value})}>
            <option value="">All Status</option>
            <option>Pending</option>
            <option>Processing</option>
            <option>Shipped</option>
            <option>Delivered</option>
            <option>Cancelled</option>
          </select>
          <input placeholder="Search..." className="input" onChange={(e) => setFilters({...filters, search: e.target.value})} />
          <button onClick={fetchData} className="bg-blue-600 text-white rounded-xl p-3">Apply</button>
        </div>
        <div className="flex gap-2 mt-2">
          <button onClick={() => setQuickDate(0)} className="chip">Today</button>
          <button onClick={() => setQuickDate(7)} className="chip">7 Days</button>
          <button onClick={() => setQuickDate(30)} className="chip">30 Days</button>
        </div>
      </div>

      {/* Loading/Error */}
      {loading && <p className="text-center text-gray-500">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* Stats */}
      {data && (
        <div className="grid md:grid-cols-5 gap-4">
          <StatCard title="Orders" value={data.totalOrders} icon={<FiShoppingCart />} />
          <StatCard title="Revenue" value={data.totalRevenue} icon={<FiDollarSign />} />
          <StatCard title="Pending" value={data.pending} icon={<FiClock />} />
          <StatCard title="Delivered" value={data.delivered} icon={<FiCheckCircle />} />
          <StatCard title="Cancelled" value={data.cancelled} icon={<FiXCircle />} />
        </div>
      )}

      {/* Orders - Mobile */}
      {data && (
        <div className="md:hidden space-y-2">
          {data.orders.map((o: any) => (
            <div key={o._id} className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow">
              <div className="flex justify-between items-center mb-1">
                <p className="font-medium dark:text-white">{o.customerName}</p>
                <span className={`${statusColors[o.status]} px-2 py-1 rounded-full text-xs`}>{o.status}</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-300">Rs {o.totalAmount}</p>
            </div>
          ))}
        </div>
      )}

      {/* Orders - Desktop Table */}
      {data && (
        <div className="hidden md:block overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="p-3">Customer</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.orders.map((o: any) => (
                <tr key={o._id} className="border-t">
                  <td className="p-3">{o.customerName}</td>
                  <td className="p-3">Rs {o.totalAmount}</td>
                  <td className="p-3">
                    <span className={`${statusColors[o.status]} px-2 py-1 rounded-full text-xs`}>{o.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow flex gap-3 items-center">
      <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h2 className="font-bold">{value}</h2>
      </div>
    </div>
  );
}
