import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  role: string;
  permissions: string[];
  name: string;
}

export const useUserRole = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const userData = localStorage.getItem("userData");
    
    setUserRole(role);
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  return { userRole, user, loading };
};

export const useCheckAccess = (allowedRoles: string[]) => {
  const { userRole, user, loading } = useUserRole();
  const hasAccess = userRole ? allowedRoles.includes(userRole) : false;

  return { hasAccess, loading, userRole, user };
};

export const useCheckPermission = (requiredPermission: string) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const permissionsJSON = localStorage.getItem("userPermissions");
    const permissions = permissionsJSON ? JSON.parse(permissionsJSON) : [];
    
    setHasPermission(
      permissions.includes(requiredPermission) || 
      permissions.includes("admin:full_access")
    );
    setLoading(false);
  }, [requiredPermission]);

  return { hasPermission, loading };
};

export const useUserPermissions = () => {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const permissionsJSON = localStorage.getItem("userPermissions");
    const perms = permissionsJSON ? JSON.parse(permissionsJSON) : [];
    
    setPermissions(perms);
    setLoading(false);
  }, []);

  return { permissions, loading };
};
