"use client";

import { LoadingCard } from "@/components/Loading";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import Link from "next/link";
import { FiEdit, FiEye, FiGitBranch, FiHash, FiMapPin, FiPlus, FiRefreshCcw, FiTrash2 } from "react-icons/fi";

interface Branch {
  _id: string;
  name: string;
  code: string;
  address: string;
  status: string;
}

export default function Branches() {
  const [data, setData] = useState<Branch[]>([]);
  const [showDeleted, setShowDeleted] = useState(false); // Toggle for trash
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole"));
  }, []);

  const canCreate = userRole === "Admin" || userRole === "BranchManager";
  const canEdit = userRole === "Admin" || userRole === "BranchManager";
  const canDelete = userRole === "Admin" || userRole === "BranchManager";

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const url = showDeleted ? "/branches/trash" : "/branches/all";
      const json = await apiClient.get(url);
      setData(json.data || []);
    } catch (err: any) {
      setError("Failed to load branches.");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Soft delete branch
  const del = async (id: string) => {
    if (!confirm("Are you sure you want to delete this branch?")) return;

    try {
      await apiClient.delete(`/branches/${id}`);
      alert("Branch deleted ✅");
      fetchData();
    } catch (err) {
      alert("Failed to delete branch");
    }
  };

  // Restore branch from trash
  const restore = async (id: string) => {
    if (!confirm("Restore this branch?")) return;

    try {
      await apiClient.put(`/branches/${id}/restore`, {});
      alert("Branch restored ✅");
      fetchData();
    } catch (err) {
      alert("Failed to restore branch");
    }
  };

  useEffect(() => {
    fetchData();
  }, [showDeleted]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {showDeleted ? "Deleted Branches" : "Branch Management"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {showDeleted ? "Manage deleted branches" : "Manage and monitor all branches"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!showDeleted && canCreate && (
            <Link
              href="/dashboard/branches/create"
              className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <FiPlus className="w-4 h-4" />
              Add Branch
            </Link>
          )}

          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className={`flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition-all duration-200 ${
              showDeleted
                ? "bg-linear-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                : "bg-linear-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            }`}
          >
            <FiRefreshCcw className="w-4 h-4" />
            {showDeleted ? "Back to Active" : "View Trash"}
          </button>
        </div>
      </div>

      {/* Access Notice */}
      {!canCreate && !canEdit && !canDelete && (
        <div className="bg-linear-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/40 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 dark:text-yellow-400">📖</span>
            </div>
            <div>
              <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Read-Only Access</h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Only Admin and BranchManager can create, edit, or delete branches.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600 dark:text-gray-400">Loading branches...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
              <span className="text-red-600 dark:text-red-400">❌</span>
            </div>
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Branch Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((b) => (
            <div
              key={b._id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {b.name}
                  </h3>
                  <StatusBadge status={b.status} />
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <FiHash className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{b.code}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <FiMapPin className="w-4 h-4" />
                    </div>
                    <span className="text-sm">{b.address}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  {!showDeleted ? (
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/branches/${b._id}`}
                        className="flex items-center gap-2 px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200 font-medium"
                      >
                        <FiEye className="w-4 h-4" />
                        View
                      </Link>

                      {canEdit && (
                        <Link
                          href={`/dashboard/branches/edit/${b._id}`}
                          className="flex items-center gap-2 px-3 py-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors duration-200 font-medium"
                        >
                          <FiEdit className="w-4 h-4" />
                          Edit
                        </Link>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => restore(b._id)}
                      className="flex items-center gap-2 px-3 py-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors duration-200 font-medium"
                    >
                      <FiRefreshCcw className="w-4 h-4" />
                      Restore
                    </button>
                  )}

                  {canDelete && !showDeleted && (
                    <button
                      onClick={() => del(b._id)}
                      className="flex items-center gap-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 font-medium"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && data.length === 0 && !error && (
        <EmptyState
          icon={<FiGitBranch className="w-8 h-8 text-gray-400" />}
          title={showDeleted ? "No deleted branches" : "No branches found"}
          description={
            showDeleted
              ? "Deleted branches will appear here"
              : "Get started by creating your first branch"
          }
          action={
            !showDeleted && canCreate
              ? {
                  label: "Add Branch",
                  href: "/dashboard/branches/create",
                  icon: <FiPlus className="w-4 h-4" />
                }
              : undefined
          }
        />
      )}
    </div>
  );
}