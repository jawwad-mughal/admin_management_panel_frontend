"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiEye, FiEyeOff } from "react-icons/fi";
import apiClient from "@/lib/api";

interface Branch {
  _id: string;
  name: string;
}

export default function CreateUserPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Employee",
    status: "Active",
    branch: "",
  });

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
          { label: "Delete Products", value: "products:delete" },
        ]
      },
      {
        group: "Categories",
        perms: [
          { label: "View Categories", value: "categories:read" },
          { label: "Create Categories", value: "categories:create" },
          { label: "Update Categories", value: "categories:update" },
          { label: "Delete Categories", value: "categories:delete" },
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
          { label: "Delete Users", value: "users:delete" },
        ]
      },
      {
        group: "Branches",
        perms: [
          { label: "View Branches", value: "branches:read" },
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
    ]
  };

  // Fetch branches on mount
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

  const handleChange = (e: any) => {
    const updatedForm = {
      ...form,
      [e.target.name]: e.target.value,
    };

    // Reset permissions when role changes
    if (e.target.name === "role") {
      setSelectedPermissions([]);
    }

    setForm(updatedForm);
  };

  const handlePermissionChange = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.branch && (form.role === "Employee" || form.role === "BranchManager")) {
      alert("Branch is required for Employees and Managers");
      return;
    }

    try {
      const payload = {
        ...form,
        permissions: selectedPermissions,
      };
      await apiClient.post("/users/create", payload);
      alert("User created ✅");
      router.push("/dashboard/users");
    } catch (error) {
      alert((error as Error).message || "User create failed");
    }
  };

  return (
    <div className="max-w-md mx-auto ">
      <h1 className="text-xl font-bold mb-3 dark:text-white">Add New User</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow space-y-4"
      >
        {/* Name */}
        <div>
          <label className="block text-sm mb-1 dark:text-gray-300">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm mb-1 dark:text-gray-300">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm mb-1 dark:text-gray-300">
            Password
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 pr-10 dark:bg-gray-700 dark:text-white"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-500"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm mb-1 dark:text-gray-300">Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:text-white"
          >
            <option value="Employee">Employee</option>
            <option value="BranchManager">Branch Manager</option>
            <option value="User">User</option>
          </select>
        </div>

        {/* Branch - Show for Employee and BranchManager */}
        {(form.role === "Employee" || form.role === "BranchManager") && (
          <div>
            <label className="block text-sm mb-1 dark:text-gray-300">
              Branch *
            </label>
            <select
              name="branch"
              value={form.branch}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:text-white"
              required={ form.role === "Employee" || form.role === "BranchManager" }
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
            {permissionsByRole[form.role]?.map((group) => (
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

        {/* Status */}
        <div>
          <label className="block text-sm mb-1 dark:text-gray-300">
            Status
          </label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:text-white"
          >
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 ">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Create User
          </button>

          <Link
            href="/dashboard/users"
            className="bg-gray-300 text-black px-4 py-2 rounded-lg inline-block"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
