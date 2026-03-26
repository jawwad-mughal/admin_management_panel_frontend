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


  const router = useRouter();

  // ===== Load Users =====
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await apiClient.get("/users/getall");
        setUsers(Array.isArray(data) ? data : data.data || []);
      } catch (err: any) {
        console.error("Error loading users:", err);
        alert(err.message || "Error loading users");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  // ===== Delete =====
  const handleDelete = async (id: string) => {
    const confirm = window.confirm("Delete this user?");
    if (!confirm) return;

    try {
      await apiClient.delete(`/users/delete/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      alert("User deleted ✅");
    } catch (error: any) {
      console.error("Error deleting user:", error);
      alert(error.message || "Error deleting user");
    }
  };

  // ===== Edit =====
  const handleEdit = (id: string) => {
    router.push(`/dashboard/users/edit/${id}`);
  };

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "Active").length;
  const inactiveUsers = users.filter((u) => u.status === "Inactive").length;

  // ===== Search Filter =====
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const statusColors: any = {
    Active: "bg-green-100 text-green-600",
    Inactive: "bg-red-100 text-red-600",
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold dark:text-white">Users Management</h1>

        {/* Add User Button with Tooltip */}
        
          <div className="relative group inline-block">
            <Link
              href="/dashboard/users/create"
              className="flex items-center justify-center gap-2 bg-blue-600 text-white pl-2.5 pr-1.5 py-2 rounded-lg hover:bg-blue-700"
            >
              <FiUserPlus size={18} />
              {/* Optional: text inside button */}
            </Link>

            {/* Tooltip */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-7 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
              <div className="bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                Add User
              </div>
            </div>
          </div>
        
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard title="Total Users" value={totalUsers} />
        <StatCard title="Active Users" value={activeUsers} />
        <StatCard title="Inactive Users" value={inactiveUsers} />
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



      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-10 text-center dark:text-white">
            Loading users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-10 text-center dark:text-white">No Users Found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
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
                    className="border-t hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 font-medium dark:text-white">
                      {user.name}
                    </td>

                    <td className="px-6 py-4 dark:text-gray-300">
                      {user.email}
                    </td>

                    <td className="px-6 py-4 dark:text-gray-300">
                      {user.role}
                    </td>

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
