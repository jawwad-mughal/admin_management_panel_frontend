// Main exports for easy importing
export * from "./auth-context";
export * from "./api";
export * from "./types";
export * from "./usePermissions";
export * from "./usePermission";
export * from "./accessControl";

// Re-export commonly used items
export { useAuth } from "./auth-context";
export { apiClient } from "./api";
export { usePermissions } from "./usePermissions";
export { useUserRole, useCheckAccess, useCheckPermission } from "./usePermission";
export { hasAccess, canAccess } from "./accessControl";