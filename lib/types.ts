// User & Auth Types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  branch?: string;
  permissions: Permission[];
  phone?: string;
  countryCode?: string;
  dialCode?: string;
  flag?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserRole = "Admin" | "BranchManager" | "Employee" | "User";
export type UserStatus = "Active" | "Inactive";
export type Permission =
  | "admin:full_access"
  | "products:read"
  | "products:create"
  | "products:update"
  | "products:delete"
  | "categories:read"
  | "categories:create"
  | "categories:update"
  | "categories:delete"
  | "orders:read"
  | "orders:create"
  | "orders:update"
  | "orders:delete"
  | "users:read"
  | "users:create"
  | "users:update"
  | "users:delete"
  | "branches:read"
  | "branches:create"
  | "branches:update"
  | "branches:delete"
  | "reports:read"
  | "reports:create"
  | "reports:update"
  | "reports:delete";

// Product Types
export interface Product {
  _id: string;
  name: string;
  slug?: string;
  description: string;
  price: number;
  cost?: number;
  quantity: number;
  category: string;
  branch: string;
  image?: string;
  images?: string[];
  status: "Active" | "Inactive";
  createdAt: Date;
  updatedAt: Date;
}

// Category Types
export interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  status: "Active" | "Inactive";
  createdAt: Date;
  updatedAt: Date;
}

// Order Types
export interface Order {
  _id: string;
  orderNumber: string;
  user: User;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  branch: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
}

export type OrderStatus = "Pending" | "Processing" | "Completed" | "Cancelled";

// Branch Types
export interface Branch {
  _id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  status: "Active" | "Inactive";
  createdAt: Date;
  updatedAt: Date;
}

// Notification Types
export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "Info" | "Warning" | "Error" | "Success";
  user: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Report Types
export interface Report {
  _id: string;
  title: string;
  type: ReportType;
  startDate: Date;
  endDate: Date;
  data: any;
  createdBy: string;
  createdAt: Date;
}

export type ReportType = "Sales" | "Inventory" | "Users" | "Custom";

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  statusCode: number;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  statusCode: number;
}

// Form Data Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  phone: string;
  countryCode: string;
  dialCode: string;
  flag: string;
}

export interface CreateUserFormData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  branch?: string;
  status: UserStatus;
  permissions?: Permission[];
}

export interface CreateProductFormData {
  name: string;
  description: string;
  price: number;
  cost?: number;
  quantity: number;
  category: string;
  image?: File;
  status: "Active" | "Inactive";
}
