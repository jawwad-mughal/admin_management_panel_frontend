"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import apiClient from "./api";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  branch?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (data: SignupData) => Promise<void>;
  isAuthenticated: boolean;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  role?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data on mount
    const userData = localStorage.getItem("userData");
    const accessToken = localStorage.getItem("accessToken");

    if (userData && accessToken) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("userData");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem("userData", JSON.stringify(data.user));
        localStorage.setItem("accessToken", data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken);
        }
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const signup = async (data: SignupData) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Signup failed");
      }

      const responseData = await response.json();

      if (responseData.success && responseData.user) {
        setUser(responseData.user);
        localStorage.setItem("userData", JSON.stringify(responseData.user));
        localStorage.setItem("accessToken", responseData.accessToken);
        if (responseData.refreshToken) {
          localStorage.setItem("refreshToken", responseData.refreshToken);
        }
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("userData");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    signup,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
