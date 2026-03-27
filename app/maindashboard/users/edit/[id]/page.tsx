"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import apiClient from "@/lib/api";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "User" | "Admin" | "Employee" | "BranchManager";
  status: "Active" | "Inactive";
  branch?: string;
  permissions?: string[];
}

interface Branch {
  _id: string;
  name: string;
}

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id;

  const [user, setUser] = useState<User>({
    _id: "",
    name: "",
    email: "",
    role: "User",
    status: "Active",
    branch: "",
  });

  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Permission options based on role
  const permissionsByRole: Record<string, { group: string; perms: { label: string; value: string }[] }[]> = {
    Employee: [
      {
        group: "Products",
        perms: [
          { label: "View Products", value: "products:read" },
        ]
      },
      {
        group: "Categories",
        perms: [
          { label: "View Categories", value: "categories:read" },
        ]
      },
      {
        group: "Orders",
        perms: [
          { label: "View Orders", value: "orders:read" },
          { label: "Create Orders", value: "orders:create" },
          { label: "Update Orders", value: "orders:update" },
        ]
      },
      {
        group: "Reports",
        perms: [
          { label: "View Reports", value: "reports:read" },
        ]
      },
    ],
    BranchManager: [
      {
        group: "Products",
        perms: [
          { label: "View Products", value: "products:read" },
          { label: "Create Products", value: "products:create" },
          { label: "Update Products", value: "products:update" },
        ]
      },
      {
        group: "Categories",
        perms: [
          { label: "View Categories", value: "categories:read" },
          { label: "Create Categories", value: "categories:create" },
          { label: "Update Categories", value: "categories:update" },
        ]
      },
      {
        group: "Orders",
        perms: [
          { label: "View Orders", value: "orders:read" },
          { label: "Create Orders", value: "orders:create" },
          { label: "Update Orders", value: "orders:update" },
        ]
      },
      {
        group: "Users",
        perms: [
          { label: "View Users", value: "users:read" },
          { label: "Create Users", value: "users:create" },
          { label: "Update Users", value: "users:update" },
        ]
      },
      {
        group: "Branches",
        perms: [
          { label: "View Branches", value: "branches:read" },
          { label: "Update Branches", value: "branches:update" },
        ]
      },
      {
        group: "Reports",
        perms: [
          { label: "View Reports", value: "reports:read" },
        ]
      },
    ],
    User: [
      {
        group: "Products",
        perms: [
          { label: "View Products", value: "products:read" },
        ]
      },
      {
        group: "Categories",
        perms: [
          { label: "View Categories", value: "categories:read" },
        ]
      },
      {
        group: "Orders",
        perms: [
          { label: "View Orders", value: "orders:read" },
        ]
      },
    ],
    Admin: [
      {
        group: "All Access",
        perms: [
          { label: "Full System Access", value: "admin:full_access" },
        ]
      },
    ],
  };

  // Fetch branches
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const data = await apiClient.get("/branches/all");
        if (data.success && Array.isArray(data.data)) {
          setBranches(data.data);
        } else if (Array.isArray(data)) {
          setBranches(data);
        }
      } catch (error) {
        console.error("Failed to fetch branches:", error);
      }
    };

    fetchBranches();
  }, []);

  // Fetch single user data on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await apiClient.get(`/users/get/${userId}`);
        setUser(data.user);
        setSelectedPermissions(data.user?.permissions || []);
        setError(null);
        setLoading(false);
      } catch (err: any) {
        console.error("Failed to load user:", err);
        const errorMsg = err?.message || err?.response?.data?.message || "Failed to load user";
        setError(errorMsg);
        setLoading(false);
      }
    };

    loadUser();
  }, [userId]);

  // Form change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedUser = { ...user, [name]: value };

    // Reset permissions when role changes
    if (name === "role") {
      setSelectedPermissions([]);
    }

    setUser(updatedUser);
  };

  const handlePermissionChange = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  // Submit updated user
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user.branch && (user.role === "Employee" || user.role === "BranchManager")) {
      alert("Branch is required for Employees and Managers");
      return;
    }

    try {
      const payload = {
        ...user,
        permissions: selectedPermissions,
      };
      await apiClient.put(`/users/update/${userId}`, payload);
      alert("User updated ✅");
      router.push("/maindashboard/users");
    } catch (err) {
      alert("Error: " + ((err as Error).message || "Update failed"));
    }
  };

  // Cancel button handler
  const handleCancel = () => {
    router.push("/maindashboard/users");
  };

  if (loading) return <p className="text-center mt-10">Loading user...</p>;

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
        <h1 className="text-xl font-bold mb-4 text-red-600 dark:text-red-400">Error Loading User</h1>
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg mb-4">
          <p>{error}</p>
        </div>
        <button
          onClick={() => router.push("/maindashboard/users")}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          ← Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto  p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
      <h1 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Edit User</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 dark:text-gray-300">Name</label>
          <input
            type="text"
            name="name"
            value={user.name}
            onChange={handleChange}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-300">Email</label>
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-300">Role</label>
          <select
            name="role"
            value={user.role}
            onChange={handleChange}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
          >
            <option value="User">User</option>
            <option value="Employee">Employee</option>
            <option value="BranchManager">Branch Manager</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        {/* Branch - Show for Employee and BranchManager */}
        {(user.role === "Employee" || user.role === "BranchManager") && (
          <div>
            <label className="block text-gray-700 dark:text-gray-300">
              Branch *
            </label>
            <select
              name="branch"
              value={user.branch || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Select Branch</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Permissions */}
        <div className="border-t pt-4">
          <label className="block text-sm font-semibold mb-3 dark:text-white">
            Access Permissions
          </label>
          <div className="space-y-3">
            {permissionsByRole[user.role]?.map((group) => (
              <div key={group.group}>
                <h4 className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase">
                  {group.group}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {group.perms.map((perm) => (
                    <label
                      key={perm.value}
                      className="flex items-center gap-2 cursor-pointer dark:text-gray-300"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(perm.value)}
                        onChange={() => handlePermissionChange(perm.value)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-300">Status</label>
          <select
            name="status"
            value={user.status}
            onChange={handleChange}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="flex gap-2 pt-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Update User
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}