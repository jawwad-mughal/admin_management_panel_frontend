"use client";

import React from "react";
import { useAuth } from "./auth-context";

/**
 * Check if user has specific permission
 */
export const hasPermission = (userPermissions: string[] | undefined, permission: string): boolean => {
  if (!userPermissions) return false;
  return userPermissions.includes("admin:full_access") || userPermissions.includes(permission);
};

/**
 * Check if user role matches any of the allowed roles
 */
export const hasRole = (userRole: string | undefined, allowedRoles: string[]): boolean => {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
};

/**
 * Get permissions based on user role
 */
export const getDefaultPermissions = (role: string): string[] => {
  const rolePermissions: Record<string, string[]> = {
    Admin: [
      "admin:full_access",
      "products:read", "products:create", "products:update", "products:delete",
      "categories:read", "categories:create", "categories:update", "categories:delete",
      "orders:read", "orders:create", "orders:update", "orders:delete",
      "users:read", "users:create", "users:update", "users:delete",
      "branches:read", "branches:create", "branches:update", "branches:delete",
      "reports:read", "reports:create", "reports:update", "reports:delete"
    ],
    BranchManager: [
      "products:read", "products:create", "products:update",
      "categories:read", "categories:create", "categories:update",
      "orders:read", "orders:create", "orders:update",
      "users:read", "users:create", "users:update",
      "branches:read", "branches:update",
      "reports:read"
    ],
    Employee: [
      "products:read",
      "categories:read",
      "orders:read", "orders:create", "orders:update",
      "reports:read"
    ],
    User: [
      "products:read",
      "categories:read",
      "orders:read"
    ]
  };
  return rolePermissions[role] || [];
};

/**
 * Custom hook to check permissions
 */
export const usePermissions = () => {
  const { user } = useAuth();

  const can = (permission: string): boolean => {
    if (!user) {
      return false;
    }
    const permissions = user.permissions || getDefaultPermissions(user.role);
    return hasPermission(permissions, permission);
  };

  const canAny = (permissions: string[]): boolean => {
    if (!user) return false;
    const userPerms = user.permissions || getDefaultPermissions(user.role);
    return permissions.some(p => hasPermission(userPerms, p));
  };

  const canAll = (permissions: string[]): boolean => {
    if (!user) return false;
    const userPerms = user.permissions || getDefaultPermissions(user.role);
    return permissions.every(p => hasPermission(userPerms, p));
  };

  const hasRole = (roles: string[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const isAdmin = (): boolean => {
    return user?.role === "Admin";
  };

  const isBranchManager = (): boolean => {
    return user?.role === "BranchManager";
  };

  const isEmployee = (): boolean => {
    return user?.role === "Employee";
  };

  return {
    user,
    can,
    canAny,
    canAll,
    hasRole,
    isAdmin,
    isBranchManager,
    isEmployee,
  };
};
