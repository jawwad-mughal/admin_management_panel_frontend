"use client";

import { FiSearch, FiUserPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isMobileTiny, setIsMobileTiny] = useState(false);
  const router = useRouter();

  // Detect tiny screens
  useEffect(() => {
    const handleResize = () => setIsMobileTiny(window.innerWidth <= 500);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await apiClient.get("/users/getall");
        setUsers(Array.isArray(data) ? data : data.data || []);
      } catch (err: any) {
        console.error("Error loading users:", err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await apiClient.delete(`/users/delete/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (error: any) {
      console.error(error);
    }
  };

  const handleEdit = (id: string) => router.push(`/maindashboard/users/edit/${id}`);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors: any = {
    Active: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    Inactive: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold dark:text-white">Users Management</h1>
        <div className="relative group inline-block">
          <Link
            href="/maindashboard/users/create"
            className="flex items-center justify-center gap-2 bg-blue-600 text-white pl-2.5 pr-1.5 py-2 rounded-lg hover:bg-blue-700"
          >
            <FiUserPlus size={18} />
          </Link>
          <div className="absolute left-1/2 -translate-x-1/2 -top-7 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
            <div className="bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              Add User
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard title="Total Users" value={users.length} />
        <StatCard title="Active Users" value={users.filter((u) => u.status === "Active").length} />
        <StatCard title="Inactive Users" value={users.filter((u) => u.status === "Inactive").length} />
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
        <FiSearch className="text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="text"
          placeholder="Search users..."
          className="w-full bg-transparent outline-none dark:text-white"
        />
      </div>

      {/* Users List */}
      {loading ? (
        <div className="p-10 text-center dark:text-white">Loading users...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-10 text-center dark:text-white">No Users Found</div>
      ) : isMobileTiny ? (
        // CARD VIEW for <350px
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium dark:text-white">{user.name}</span>
                <span
                  className={`${statusColors[user.status]} px-2 py-1 rounded-full text-xs`}
                >
                  {user.status}
                </span>
              </div>
              <div className="text-sm dark:text-gray-300 mb-1">{user.email}</div>
              <div className="text-sm dark:text-gray-300 mb-1">Role: {user.role}</div>
              <div className="flex gap-4 mt-2">
                <button
                  onClick={() => handleEdit(user._id)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <FiEdit />
                </button>
                <button
                  onClick={() => handleDelete(user._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // TABLE VIEW for larger screens
        <div className="overflow-x-auto">
          <table className="w-full min-w-150 text-sm text-left table-fixed">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user._id}
                  className="border-t hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-6 py-4 font-medium dark:text-white">{user.name}</td>
                  <td className="px-6 py-4 dark:text-gray-300">{user.email}</td>
                  <td className="px-6 py-4 dark:text-gray-300">{user.role}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`${statusColors[user.status]} px-3 py-1 rounded-full text-xs`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-4">
                    <button
                      onClick={() => handleEdit(user._id)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiTrash2 />
                    </button>
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

function StatCard({ title, value }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
      <p className="text-gray-500 dark:text-gray-400 text-sm">{title}</p>
      <h2 className="text-3xl font-bold dark:text-white mt-2">{value}</h2>
    </div>
  );
}
