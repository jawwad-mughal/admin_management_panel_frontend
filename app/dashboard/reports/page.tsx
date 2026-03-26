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
  FiTruck,
} from "react-icons/fi";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import apiClient from "@/lib/api";

export default function Reports() {
  
  const [data, setData] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "",
    search: "",
    branch: "", // ✅ NEW
  });

  // 🔥 Fetch branches
  const fetchBranches = async () => {
    try {
      const json = await apiClient.get("/branches/all");
      setBranches(json.data);
    } catch (err) {
      console.error("Error fetching branches:", err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      const query = `?page=${page}&startDate=${filters.startDate}&endDate=${filters.endDate}&status=${filters.status}&search=${filters.search}&branch=${filters.branch}`;

      const json = await apiClient.get(`/reports${query}`);
      setData(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches(); // ✅ load branches
    fetchData();
  }, [page]);

  // 🔥 Quick Date
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

  // 🔥 Export CSV
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
    <div className="space-y-3">

      {/* HEADER */}
      <div className="px-6 py-3 rounded-2xl flex justify-between items-center bg-white dark:bg-gray-800 shadow">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">
            Reports Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            Business insights
          </p>
        </div>

        <div className="flex gap-2">
          
            <button
              onClick={fetchData}
              className="bg-blue-600 px-4 py-2 rounded-lg flex items-center gap-2 text-white"
            >
              <FiRefreshCcw /> Refresh
            </button>
      

          
            <button
              onClick={exportCSV}
              className="bg-blue-600 px-4 py-2 rounded-lg flex items-center gap-2 text-white"
            >
              <FiDownload /> Export
            </button>
      
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow space-y-4">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          <FiFilter /> Filters
        </div>

        <div className="grid md:grid-cols-6 gap-3">

          <input
            type="date"
            className="input"
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
          />

          <input
            type="date"
            className="input"
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
          />

          {/* ✅ Branch Filter */}
          <select
            className="input"
            onChange={(e) =>
              setFilters({ ...filters, branch: e.target.value })
            }
          >
            <option value="">All Branches</option>
            {branches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            className="input"
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value })
            }
          >
            <option value="">All Status</option>
            <option>Pending</option>
            <option>Processing</option>
            <option>Shipped</option>
            <option>Delivered</option>
            <option>Cancelled</option>
          </select>

          <input
            placeholder="Search..."
            className="input"
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value })
            }
          />

          <button
            onClick={fetchData}
            className="bg-blue-600 text-white rounded-lg"
          >
            Apply
          </button>
        </div>

        {/* Quick */}
        <div className="flex gap-2">
          <button onClick={() => setQuickDate(0)} className="chip">
            Today
          </button>
          <button onClick={() => setQuickDate(7)} className="chip">
            7 Days
          </button>
          <button onClick={() => setQuickDate(30)} className="chip">
            30 Days
          </button>
        </div>
      </div>

      {/* STATS */}
      {data && (
        <div className="grid md:grid-cols-5 gap-5">
          <StatCard title="Orders" value={data.totalOrders} icon={<FiShoppingCart />} />
          <StatCard title="Revenue" value={data.totalRevenue} icon={<FiDollarSign />} />
          <StatCard title="Pending" value={data.pending} icon={<FiClock />} />
          <StatCard title="Delivered" value={data.delivered} icon={<FiCheckCircle />} />
          <StatCard title="Cancelled" value={data.cancelled} icon={<FiXCircle />} />
        </div>
      )}

      {/* TABLE */}
      {data && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden">
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
                  <td className="p-3">{o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// STAT CARD
function StatCard({ title, value, icon }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow flex gap-3 items-center">
      <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded">{icon}</div>

      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h2 className="font-bold">{value}</h2>
      </div>
    </div>
  );
}
