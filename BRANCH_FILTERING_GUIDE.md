# Branch Filtering Guide for BranchManagers

This guide shows how to implement branch-based data filtering for BranchManager role.

## Concept

When a user with BranchManager role logs in, they should only see data related to their assigned branch. This is crucial for multi-branch management systems where each branch manager should not have access to other branches' data.

## Implementation Steps

### Step 1: Update API Calls to Filter by Branch

First, ensure your backend API endpoints support branch filtering:

```typescript
// Example endpoint that filters by branch
GET /products/branch/:branchId
GET /categories/branch/:branchId
GET /orders/branch/:branchId
```

### Step 2: Add Branch Information to Auth Context

Ensure your auth context includes the user's branch ID:

```typescript
// lib/auth-context.tsx
interface AuthContextType {
  user: {
    _id: string;
    name: string;
    email: string;
    role: "Admin" | "BranchManager" | "Employee" | "User";
    branch?: string; // Add this for BranchManager
    permissions: string[];
  } | null;
}
```

### Step 3: Create a Hook to Get User's Branch Filter

```typescript
// lib/useBranchFilter.ts
import { useAuth } from "@/lib/auth-context";
import { usePermissions } from "@/lib/usePermissions";

export function useBranchFilter() {
  const { user } = useAuth();
  const { isBranchManager, isAdmin } = usePermissions();

  return {
    shouldFilterByBranch: isBranchManager() && user?.branch,
    branchId: user?.branch,
    isFiltered: isBranchManager(),
  };
}
```

### Step 4: Example Implementation - Products Page

```typescript
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useBranchFilter } from "@/lib/useBranchFilter";
import apiClient from "@/lib/api";

interface Product {
  _id: string;
  name: string;
  branch?: string;
  price: number;
  stock: number;
}

export default function ProductsPage() {
  const { user } = useAuth();
  const { shouldFilterByBranch, branchId, isFiltered } = useBranchFilter();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let endpoint = "/products/all";
        
        // If BranchManager, filter by their branch
        if (shouldFilterByBranch && branchId) {
          endpoint = `/products/branch/${branchId}`;
        }
        
        const data = await apiClient.get(endpoint);
        setProducts(Array.isArray(data.data) ? data.data : []);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [shouldFilterByBranch, branchId]);

  return (
    <div>
      {/* Show filter status info for BranchManager */}
      {isFiltered && branchId && (
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <p className="text-blue-800">
            📍 Showing products for your branch only
          </p>
        </div>
      )}

      {/* Products table/list */}
      <div>
        {products.map((product) => (
          <div key={product._id}>{product.name}</div>
        ))}
      </div>
    </div>
  );
}
```

### Step 5: Update Categories Page with Branch Filtering

```typescript
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useBranchFilter } from "@/lib/useBranchFilter";
import { Protected, usePermissions } from "@/lib";
import apiClient from "@/lib/api";

interface Category {
  _id: string;
  name: string;
  branch: string;
}

export default function CategoriesPage() {
  const { user } = useAuth();
  const { shouldFilterByBranch, branchId } = useBranchFilter();
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchCategories = async () => {
    try {
      let url = "/categories/all";
      
      // For BranchManagers, only show their branch's categories
      if (shouldFilterByBranch && branchId) {
        url = `/categories/branch/${branchId}`;
      }
      
      const data = await apiClient.get(url);
      setCategories(data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [shouldFilterByBranch, branchId]);

  return (
    <div className="space-y-4">
      {/* Header with role-based visibility */}
      <div className="flex justify-between items-center">
        <h1>Categories Management</h1>
        <Protected permission="categories:create">
          {/* Create button only for authorized users */}
          <button>Create Category</button>
        </Protected>
      </div>

      {/* Info for BranchManagers */}
      {shouldFilterByBranch && (
        <div className="bg-blue-50 p-3 rounded">
          <p className="text-sm text-blue-800">
            You're viewing categories assigned to your branch
          </p>
        </div>
      )}

      {/* Categories list/table */}
      <div>
        {categories.map((cat) => (
          <div key={cat._id}>{cat.name}</div>
        ))}
      </div>
    </div>
  );
}
```

### Step 6: Update Orders Page with Branch Filtering

```typescript
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useBranchFilter } from "@/lib/useBranchFilter";
import { Protected } from "@/lib";
import apiClient from "@/lib/api";

interface Order {
  _id: string;
  customerName: string;
  branch: string;
  totalAmount: number;
  status: string;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const { shouldFilterByBranch, branchId } = useBranchFilter();
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = async () => {
    try {
      let url = "/orders/all";
      
      // BranchManager sees only their branch's orders
      if (shouldFilterByBranch && branchId) {
        url = `/orders/branch/${branchId}`;
      }
      
      const data = await apiClient.get(url);
      setOrders(data.data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [shouldFilterByBranch, branchId]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1>Orders Management</h1>
        <Protected permission="orders:create">
          <button>Create Order</button>
        </Protected>
      </div>

      {/* Branch info */}
      {shouldFilterByBranch && (
        <div className="info-box">
          📍 Orders from your branch ({user?.branch})
        </div>
      )}

      {/* Orders table */}
      <table>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>{order.customerName}</td>
              <td>{order.totalAmount}</td>
              <td>{order.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## Backend Implementation

Ensure your backend supports these endpoints:

```typescript
// backend/src/routes/productRoutes.ts

// Get all products (Admin only)
router.get("/products/all", requirePermission("products:read"), getAllProducts);

// Get products for specific branch (BranchManager)
router.get(
  "/products/branch/:branchId",
  requirePermission("products:read"),
  getProductsByBranch
);

// backend/src/controllers/productController.ts

export const getProductsByBranch = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { branchId } = req.params;
    
    // Ensure BranchManager can only see their own branch
    if (req.user.role === "BranchManager" && req.user.branch !== branchId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const products = await Product.find({
      branch: branchId,
      deleted: false,
    });

    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ message: "Error fetching products" });
  }
};
```

## Permission Matrix by Role

| Endpoint | Admin | BranchManager | Employee | User |
|----------|-------|---------------|----------|------|
| `/products/all` | ✅ All | ❌ | ❌ | ❌ |
| `/products/branch/:id` | ✅ All | ✅ Own branch | ✅ Limited | ❌ |
| `/categories/all` | ✅ All | ❌ | ❌ | ❌ |
| `/categories/branch/:id` | ✅ All | ✅ Own branch | ✅ Limited | ❌ |
| `/orders/all` | ✅ All | ❌ | ❌ | ❌ |
| `/orders/branch/:id` | ✅ All | ✅ Own branch | ✅ Limited | ✅ Limited(Own) |

## Frontend Visibility Rules

### Admin
- Sees everything
- Can switch between all branches
- Full access to all data

### BranchManager
- Sees only their assigned branch's data
- Cannot create products/categories for other branches
- Can only manage orders from their branch
- Cannot see other branches' analytics

### Employee
- Read-only access to their branch data
- Can view products and categories
- Cannot create or modify anything

### User (Customer/Viewer)
- Read-only access to public products
- Can only see their own orders
- Limited analytics access

## Testing

Test each role:

```bash
# Login as Admin
- Navigate to Products
- Should see all branches' products
- Can create for any branch

# Login as BranchManager
- Navigate to Products  
- Should see only their branch's products
- Should see info: "Showing products for your branch only"
- Create button should only allow their branch

# Login as Employee
- Navigate to Products
- See read-only data
- No create/edit/delete buttons

# Login as User
- Cannot access protected pages
- Cannot create anything
```

## Notes

1. **Always Filter Backend**: Never trust frontend-only filtering. Always validate on backend.
2. **Show Context**: Always show users what branch they're viewing data for
3. **Prevent Leakage**: Ensure BranchManagers can't access other branches' data
4. **API Consistency**: Make sure all branch-filtered endpoints follow same pattern
5. **Error Handling**: Show clear messages when user lacks access

## Common Mistakes to Avoid

❌ Filtering only on frontend (not secure)
❌ Not showing which branch's data user is viewing
❌ Allowing branch field to be set by frontend
❌ Inconsistent endpoint naming
❌ Not validating branch ownership on backend

---

For questions or issues with branch filtering, refer to the backend API documentation and usePermissions hook examples.
