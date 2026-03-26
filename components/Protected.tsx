"use client";

import React from "react";
import { usePermissions } from "@/lib/usePermissions";

interface ProtectedProps {
  children?: React.ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean; // if true, require ALL permissions in the array
  role?: string | string[];
  fallback?: React.ReactNode;
}

/**
 * Conditional render component based on permissions
 * 
 * @example
 * <Protected permission="users:create">
 *   <button>Create User</button>
 * </Protected>
 * 
 * @example
 * <Protected permissions={["products:read", "products:update"]} requireAll>
 *   Can read AND update products
 * </Protected>
 * 
 * @example
 * <Protected role={["Admin", "BranchManager"]}>
 *   Admin or BranchManager only
 * </Protected>
 */
export const Protected: React.FC<ProtectedProps> = ({
  children,
  permission,
  permissions,
  requireAll = false,
  role,
  fallback = null,
}) => {
  const { can, canAny, canAll, hasRole, user } = usePermissions();

  // Wait for user data to load
  if (!user) {
    return <>{fallback}</>;
  }

  // Check role if provided
  if (role) {
    const roles = Array.isArray(role) ? role : [role];
    const roleMatch = hasRole(roles);
    if (!roleMatch) {
      return <>{fallback}</>;
    }
  }

  // Check permission if provided
  if (permission) {
    const hasAccess = can(permission);
    if (!hasAccess) {
      return <>{fallback}</>;
    }
  }

  // Check multiple permissions if provided
  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll ? canAll(permissions) : canAny(permissions);
    if (!hasAccess) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

interface IfProps {
  condition: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Simple conditional render component
 */
export const If: React.FC<IfProps> = ({ condition, children, fallback = null }) => {
  return condition ? <>{children}</> : <>{fallback}</>;
};

interface ShowProps {
  when: boolean;
  children: React.ReactNode;
}

/**
 * Show/hide component
 */
export const Show: React.FC<ShowProps> = ({ when, children }) => {
  return when ? <>{children}</> : null;
};

interface HideProps {
  when: boolean;
  children: React.ReactNode;
}

/**
 * Hide when condition is true
 */
export const Hide: React.FC<HideProps> = ({ when, children }) => {
  return !when ? <>{children}</> : null;
};
