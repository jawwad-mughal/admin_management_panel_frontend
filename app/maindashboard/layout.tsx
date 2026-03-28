"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import {
  FiHome,
  FiUsers,
  FiBox,
  FiShoppingCart,
  FiBarChart2,
  FiSettings,
  FiLogOut,
  FiGitBranch,
  FiTag,
  FiBell,
  FiCheck
} from "react-icons/fi";

interface NavItem {
  label: string;
  href: string;
  icon: any;
  roles: string[];
}

export default function DashboardLayout({ children }: any) {
  const router = useRouter();
  const [sidebar, setSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notificationOpen, setNotificationOpen] = useState<boolean>(false);

  // Fetch current user role on mount
  useEffect(() => {
    // Clear any stale user data on mount to ensure fresh data
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/dashboard')) {
      // Only clear if we're actually in dashboard (not during navigation)
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        console.log("🧹 Clearing potentially stale user data on dashboard load");
        localStorage.removeItem("user");
      }
    }

    // First try localStorage for role (for navigation)
    const storedRole = localStorage.getItem("userRole");
    console.log("🔍 Checking localStorage userRole:", storedRole);

    if (storedRole) {
      setUserRole(storedRole);
      console.log("✅ Loaded role from localStorage:", storedRole);
    }

    // Always fetch fresh user data from API
    const fetchUserRole = async () => {
      try {
        console.log("📡 Fetching /users/profile...");
        const response = await apiClient.get("/users/profile");
        console.log("📡 Profile API Response:", response);

        if (response) {
          console.log("✅ Got user from API:", response);
          console.log("✅ User ID:", response._id, "Name:", response.name, "Email:", response.email);

          setUserRole(response.role);
          setUser(response);
          localStorage.setItem("userRole", response.role);
          localStorage.setItem("user", JSON.stringify(response));
          console.log("✅ Updated role and user from API:", response.role);
        } else {
          console.warn("⚠️ No response from profile API");
          // If no response, clear localStorage and redirect
          localStorage.removeItem("user");
          localStorage.removeItem("userRole");
          router.replace("/login");
        }
      } catch (error) {
        console.error("❌ Profile fetch error:", error);
        // Clear localStorage and redirect to login on error
        localStorage.removeItem("user");
        localStorage.removeItem("userRole");
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [router]);

  // Detect mobile viewport and adjust sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setSidebar(false);
    } else {
      setSidebar(true);
    }
  }, [isMobile]);

  // Fetch notifications periodically
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const fetchNotifications = async () => {
      try {
        const response = await apiClient.get("/notifications");
        if (response?.data) {
          setNotifications(response.data.notifications || []);
          setUnreadCount(response.data.unreadCount || 0);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    if (userRole) {
      fetchNotifications();
      intervalId = setInterval(fetchNotifications, 15000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [userRole]);

  // Navigation items with role-based access
  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/maindashboard/dashboard",
      icon: FiHome,
      roles: ["Admin"],
      
    },
    {
      label: "Branches",
      href: "/maindashboard/branches",
      icon: FiGitBranch,
      roles: ["Admin", "BranchManager", "Employee"],
    },
    {
      label: "Users",
      href: "/maindashboard/users",
      icon: FiUsers,
      roles: ["Admin", "BranchManager"],
    },
    {
      label: "Products",
      href: "/maindashboard/products",
      icon: FiBox,
      roles: ["Admin", "BranchManager", "Employee"],
    },
    {
      label: "Categories",
      href: "/maindashboard/categories",
      icon: FiTag,
      roles: ["Admin", "BranchManager", "Employee"],
    },
    {
      label: "Orders",
      href: "/maindashboard/orders",
      icon: FiShoppingCart,
      roles: ["Admin", "BranchManager", "Employee"],
    },
    {
      label: "Reports",
      href: "/maindashboard/reports",
      icon: FiBarChart2,
      roles: ["Admin", "BranchManager", "Employee"],
    },
    {
      label: "Settings",
      href: "/maindashboard/settings",
      icon: FiSettings,
      roles: ["Admin", "BranchManager", "Employee", "User"],
    },
  ];

  // Filter nav items based on user role
  const visibleNavItems = navItems.filter((item) => {
    // While loading, show nothing to avoid showing unauthorized items
    if (!userRole) {
      console.log("⏳ No role yet, hiding all items");
      return false;
    }
    const canAccess = item.roles.includes(userRole);
    console.log(`🔑 Role: ${userRole}, Item: ${item.label}, Access: ${canAccess}`);
    return canAccess;
  });
  
  console.log("📊 Visible nav items:", visibleNavItems.length, visibleNavItems.map(i => i.label));

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
    // Clear user role and theme
    localStorage.removeItem("userRole");
    localStorage.removeItem("user");
    document.documentElement.classList.remove("dark");
    router.push("/login");
  };

  const markNotificationsRead = async () => {
    try {
      await apiClient.put("/notifications/mark-read");
      const currentUserId = user?.id || user?._id || "";
      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          readBy: currentUserId
            ? [...new Set([...(n.readBy || []), currentUserId])]
            : n.readBy,
        }))
      );
    } catch (error) {
      console.error("Failed to mark notifications read:", error);
    }
  };

  return (
    <div className={`min-h-screen flex bg-gray-100 dark:bg-gray-900 ${isMobile ? "pt-16" : ""}`}>
      {isMobile && sidebar && (
        <div
          className="fixed inset-0 bg-black/40 z-30 sm:hidden"
          onClick={() => setSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`bg-white dark:bg-gray-800 dark:text-white shadow-lg border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col fixed bottom-0 left-0 z-40 ${
          sidebar ? "w-64" : "w-20"
        } ${isMobile ? "top-14" : "top-0"} ${
          isMobile ? (sidebar ? "translate-x-0" : "-translate-x-full") : ""
        } `}
      >
        <div className="py-3 px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            {sidebar && (
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                Management
              </span>
            )}
          </div>
        </div>

        <nav className=" p-4 space-y-2">
          {visibleNavItems.length > 0 ? (
            visibleNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                    onClick={isMobile ? () => setSidebar(false) : undefined}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 group"
                >
                  <Icon className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                  {sidebar && (
                    <span className="font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })
          ) : (
            <div className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                "No menu items available"
              )}
            </div>
          )}
        </nav>
      </aside>

      {/* Main Section */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isMobile ? "pl-0" : sidebar ? "pl-64" : "pl-20"}`}>
        {/* Navbar */}
        <header className={`${isMobile ? "fixed" : "sticky"} top-0 inset-x-0 z-50 bg-white dark:bg-gray-800 dark:text-white shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 h-14 flex justify-between items-center`}>


  {/* Left */}
  <div className="flex items-center gap-4">
    <button
      onClick={() => setSidebar(!sidebar)}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
    <h1 className="text-lg font-semibold text-gray-900 dark:text-white hidden sm:block">
      Management System
    </h1>
  </div>

  {/* Right */}
  <div className="flex items-center gap-2 sm:gap-3 relative">

    {/* Notifications */}
    <div className="relative">
      <button
        onClick={() => {
          setNotificationOpen(!notificationOpen);
          if (unreadCount > 0) {
            markNotificationsRead();
          }
        }}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
        title="Notifications"
      >
        <FiBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center p-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {notificationOpen && (
        <div className={`${isMobile ? "fixed top-14 left-0 right-0 w-full max-h-60 overflow-y-auto" : "absolute mt-2 right-0 w-80 max-h-96 overflow-y-auto"} bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50`}>
          <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">Notifications</span>
            <button
              onClick={markNotificationsRead}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Mark all read
            </button>
          </div>
          {notifications.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 dark:text-gray-400">No notifications yet.</div>
          ) : (
            notifications.slice(0, 10).map((notification) => {
              const currentUserId = user?.id || user?._id || "";
              const isUnread = currentUserId
                ? !notification.readBy?.some((id: string) => id === currentUserId)
                : false;
              return (
                <div
                  key={notification._id}
                  className={`px-3 py-2 border-b last:border-b-0 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${isUnread ? "bg-gray-100 dark:bg-gray-900" : ""}`}
                >
                  <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{notification.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{notification.message}</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>

    {/* Dark Mode Toggle */}
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
      title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {darkMode ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>

    {/* Profile */}
    <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
      {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
    </div>

    {/* Logout */}
    <button
      onClick={logout}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
    >
      <FiLogOut className="w-4 h-4" />
      <span className="hidden sm:inline">Logout</span>
    </button>

  </div>
</header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 ">
          {children}
        </main>
      </div>
    </div>
  );
}
