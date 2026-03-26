// Example of role-based access matrix for frontend

export const roleAccessMatrix: Record<string, string[]> = {
  Admin: [
    "dashboard",
    "branches",
    "users",
    "products",
    "orders",
    "reports",
    "settings",
  ],
  BranchManager: [
    "dashboard",
    "branches",
    "users",
    "products",
    "orders",
    "reports",
    "settings",
  ],
  Employee: [
    "dashboard",
    "products",
    "orders",
    "settings",
  ],
  User: [
    "dashboard",
    "settings",
  ],
};

export const hasAccess = (userRole: string | null, page: string): boolean => {
  if (!userRole) return false;
  return roleAccessMatrix[userRole]?.includes(page) || false;
};

// Check if user can perform action on a specific module
export const canAccess = (userRole: string | null, module: string): boolean => {
  const accessMap: Record<string, string[]> = {
    branches: ["Admin", "BranchManager"],
    users: ["Admin", "BranchManager"],
    products: ["Admin", "BranchManager", "Employee"],
    orders: ["Admin", "BranchManager", "Employee"],
    reports: ["Admin", "BranchManager"],
  };

  if (!userRole) return false;
  return accessMap[module]?.includes(userRole) || false;
};
