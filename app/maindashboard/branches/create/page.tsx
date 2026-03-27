"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import apiClient from "@/lib/api";

export default function CreateBranch() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    code: "",
    address: "",
    city: "",
    country: "",
    phone: "",
    email: "",
    status: "Active",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const submit = async () => {
    // ✅ Validation
    if (!form.name || !form.code || !form.address || !form.phone) {
      alert("Required fields missing");
      return;
    }

    try {
      setLoading(true);
      await apiClient.post("/branches/create", form);
      alert("Branch created ✅");
      router.push("/maindashboard/branches");
    } catch (err) {
      console.error(err);
      alert((err as Error).message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-4">

      <div className="flex justify-between">

      <h1 className="text-xl font-bold dark:text-white">
        Create Branch
      </h1>
      {/* Back Button */}
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-blue-600 hover:underline"
        >
          <FiArrowLeft /> Back
        </button>
      </div>
      </div>

      {/* Inputs */}
      <Input placeholder="Branch Name *" onChange={(v) => handleChange("name", v)} />
      <Input placeholder="Branch Code *" onChange={(v) => handleChange("code", v)} />
      <Input placeholder="Address *" onChange={(v) => handleChange("address", v)} />
      <Input placeholder="Phone *" onChange={(v) => handleChange("phone", v)} />

      <Input placeholder="City" onChange={(v) => handleChange("city", v)} />
      <Input placeholder="Country" onChange={(v) =>handleChange("country", v)} />
      <Input placeholder="Email" onChange={(v) => handleChange("email", v)} />

      {/* Status */}
      <select
        className="input"
        onChange={(e) => handleChange("status", e.target.value)}
      >
        <option>Active</option>
        <option>Inactive</option>
      </select>

      {/* Button */}
      <button
        onClick={submit}
        disabled={loading}
        className="bg-blue-600 text-white w-full p-2 rounded-lg hover:bg-blue-700"
      >
        {loading ? "Creating..." : "Create Branch"}
      </button>
    </div>
  );
}

// 🔥 Reusable Input
function Input({
  placeholder,
  onChange,
}: {
  placeholder: string;
  onChange: (val: string) => void;
}) {
  return (
    <input
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="input"
    />
  );
}
