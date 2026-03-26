"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await apiClient.get("/auth/verifytoken");
        // ✅ Token valid
        router.replace("/dashboard");
      } catch {
        // ❌ Token invalid or expired
        router.replace("/login");
      }
    };

    checkAuth();
  }, [router]);

  return null; // render ke andar kuch mat dikhao
}
