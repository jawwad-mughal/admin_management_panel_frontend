# Role-Based Access Control (RBAC) Guide

## Overview

This guide shows how to implement role-based UI visibility in your application. Only users with appropriate roles and permissions will see certain UI elements, links, and buttons.

---

## Roles & Permissions Hierarchy

### Admin (Full Access)
- Can access everything
- All permissions granted
- Can manage users, branches, products, categories, orders, reports

### BranchManager (Branch-Level Access)
- Can manage products, categories, orders, users in their branch
- Can update their branch info
- Cannot create branches or see other branches
- Cannot access reports at admin level

### Employee (Limited Access)
- Can read products and categories
- Can create, read, update orders
- Can view reports only
- Cannot manage users or branches

### User (Read-Only)
- Can only read products, categories, orders
- Cannot create or update anything
- Limited report access

---

## Usage Patterns

### 1. Check User Permissions in Components

```typescript
"use client";

import { usePermissions } from "@/lib/usePermissions";

export default function UserManagement() {
  const { can, isAdmin, isBranchManager } = usePermissions();

  return (
    <div>
      {can("users:create") && (
        <button>Create User</button>
      )}

      {can("users:delete") && (
        <button>Delete User</button>
      )}

      {isAdmin() && (
        <div>Admin-only section</div>
      )}
    </div>
  );
}
```

### 2. Use Protected Component (Recommended)

```typescript
"use client";

import { Protected } from "@/components/Protected";

export default function Products() {
  return (
    <>
      {/* Only show to users with products:create permission */}
      <Protected permission="products:create">
        <button>Add Product</button>
      </Protected>

      {/* Only show to Admins or BranchManagers */}
      <Protected role={["Admin", "BranchManager"]}>
        <div>Bulk Actions</div>
      </Protected>

      {/* Only show if user has ALL permissions */}
      <Protected 
        permissions={["products:read", "products:update"]} 
        requireAll={true}
      >
        <button>Update Product</button>
      </Protected>

      {/* Show fallback if no permission */}
      <Protected 
        permission="products:delete"
        fallback={<p>You don't have permission to delete</p>}
      >
        <button>Delete Product</button>
      </Protected>
    </>
  );
}
```

### 3. Simple Conditions

```typescript
"use client";

import { If, Show, Hide } from "@/components/Protected";

export default function Dashboard() {
  const isAdmin = true;

  return (
    <>
      <If condition={isAdmin}>
        <div>Admin Dashboard</div>
      </If>

      <Show when={isAdmin}>
        <div>Admin Panel</div>
      </Show>

      <Hide when={!isAdmin}>
        <div>Only show to non-admins</div>
      </Hide>
    </>
  );
}
```

---

## Permissions Reference

### Products
- `products:read` - View products
- `products:create` - Create new products
- `products:update` - Edit products
- `products:delete` - Delete products

### Categories
- `categories:read` - View categories
- `categories:create` - Create categories
- `categories:update` - Edit categories
- `categories:delete` - Delete categories

### Orders
- `orders:read` - View orders
- `orders:create` - Create orders
- `orders:update` - Update orders
- `orders:delete` - Delete orders

### Users
- `users:read` - View users
- `users:create` - Create users
- `users:update` - Edit users
- `users:delete` - Delete users

### Branches
- `branches:read` - View branches
- `branches:create` - Create branches
- `branches:update` - Update branches
- `branches:delete` - Delete branches

### Reports
- `reports:read` - View reports
- `reports:create` - Create reports
- `reports:update` - Update reports
- `reports:delete` - Delete reports

### Admin
- `admin:full_access` - Super admin (overrides all checks)

---

## Real-World Examples

### Example 1: Users Page with Create/Edit/Delete Buttons

```typescript
"use client";

import { usePermissions, Protected } from "@/lib";
import Link from "next/link";

export default function UsersPage() {
  const { can, hasRole } = usePermissions();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1>Users</h1>
        
        {/* Only show Create button to Admin/BranchManager */}
        <Protected role={["Admin", "BranchManager"]}>
          <Link href="/dashboard/users/create" className="btn btn-primary">
            Create User
          </Link>
        </Protected>
      </div>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>John Doe</td>
            <td>john@example.com</td>
            <td>
              {/* Edit button */}
              <Protected permission="users:update">
                <Link href="/dashboard/users/edit/1" className="btn btn-sm">
                  Edit
                </Link>
              </Protected>

              {/* Delete button */}
              <Protected permission="users:delete">
                <button className="btn btn-sm btn-danger">
                  Delete
                </button>
              </Protected>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
```

### Example 2: Products Dashboard

```typescript
"use client";

import { Protected, usePermissions } from "@/lib";

export default function ProductsDashboard() {
  const { can, isAdmin, isBranchManager } = usePermissions();

  return (
    <div>
      {/* Header with conditional buttons */}
      <div className="flex gap-2">
        <Protected permission="products:create">
          <button className="btn btn-primary">Add Product</button>
        </Protected>

        <Protected role="Admin">
          <button className="btn btn-secondary">Export All</button>
        </Protected>

        <Protected permissions={["products:read", "products:update"]}>
          <button className="btn btn-secondary">Bulk Update</button>
        </Protected>
      </div>

      {/* Admin-only analytics */}
      <Protected role="Admin">
        <div className="bg-blue-50 p-4 rounded">
          <h3>Sales Analytics (Admin Only)</h3>
          <p>Total Revenue: $100,000</p>
        </div>
      </Protected>

      {/* BranchManager-only section */}
      <Protected role="BranchManager">
        <div className="bg-green-50 p-4 rounded">
          <h3>Your Branch Performance</h3>
          <p>Revenue: $50,000</p>
        </div>
      </Protected>

      {/* Employee cannot see this */}
      <Protected 
        permission="products:delete"
        fallback={<p className="text-gray-500">You don't have delete permission</p>}
      >
        <button className="btn btn-danger">Delete Multiple Products</button>
      </Protected>
    </div>
  );
}
```

### Example 3: Dynamic Navigation

Already in `app/dashboard/layout.tsx`:

```typescript
const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: FiHome,
    roles: ["Admin"],
  },
  {
    label: "Branches",
    href: "/dashboard/branches",
    icon: FiGitBranch,
    roles: ["Admin", "BranchManager", "Employee"],
  },
  {
    label: "Users",
    href: "/dashboard/users",
    icon: FiUsers,
    roles: ["Admin", "BranchManager"],
  },
  // ... more items
];

// Filter nav items based on user role
const visibleNavItems = navItems.filter((item) => {
  if (!userRole) return false;
  return item.roles.includes(userRole);
});
```

---

## How Permissions Flow

```
User Login
    ↓
Token saved in localStorage
    ↓
AuthProvider reads token
    ↓
User data stored in React context
    ↓
usePermissions() hook accesses user data
    ↓
Protected component checks permissions
    ↓
UI Elements shown/hidden
```

---

## Backend Integration

### Create API Endpoint

```typescript
// backend/src/controllers/productController.ts
export const createProduct = async (req: AuthenticatedRequest, res: Response) => {
  // Check permission at backend too!
  const userPerms = getPermissions(req);
  if (!userPerms.includes("products:create")) {
    return res.status(403).json({ message: "Permission denied" });
  }
  
  // Create product...
};
```

### Middleware Protection

```typescript
// backend/src/middleware/rbacMiddleware.ts
export const requirePermission = (permission: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userPerms = getPermissions(req);
    if (!userPerms.includes(permission)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
};

// Use in routes
router.post("/create", requirePermission("products:create"), createProduct);
```

---

## Best Practices

### ✅ DO

- Check permissions on frontend for UX
- Also check permissions on backend for security
- Use `Protected` component for cleaner code
- Use `requireAll: true` when multiple permissions required
- Test with different roles

### ❌ DON'T

- Rely only on frontend permission checks
- Show UI elements that users can't access
- Forget to protect backend endpoints
- Mix permission logic throughout components

---

## Testing with Different Roles

1. **Login as Admin** → See all features
2. **Login as BranchManager** → See branch-specific features
3. **Login as Employee** → See limited features
4. **Login as User** → See read-only access

---

## Troubleshooting

### Permissions not working?
1. Check if `AuthProvider` is in root layout
2. Verify user role in localStorage
3. Check browser DevTools console
4. Ensure backend returns correct permissions

### Elements still showing?
1. Check role/permission spelling
2. Verify user has correct role assigned
3. Check if token is still valid
4. Refresh page to reload permissions

### Backend rejecting valid users?
1. Check middleware order
2. Verify token is being sent
3. Check permission array in backend
4. Test with Postman/API tool

---

## Permission Matrix

| Feature | Admin | BranchManager | Employee | User |
|---------|-------|---------------|----------|------|
| **Users** | CRUD | R,C,U,D | R | R |
| **Branches** | CRUD | R,U | R | R |
| **Products** | CRUD | CRUD | R | R |
| **Categories** | CRUD | CRUD | R | R |
| **Orders** | CRUD | CRUD | C,R,U | R |
| **Reports** | CRUD | R | R | R |
| **Settings** | CRUD | R,U | R,U | R |

Legend: C=Create, R=Read, U=Update, D=Delete

---

For questions or issues, refer to the inline code comments and examples!
