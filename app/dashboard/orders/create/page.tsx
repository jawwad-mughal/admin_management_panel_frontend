"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiX, FiPlus } from "react-icons/fi";
import apiClient from "@/lib/api";

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
}

interface Branch {
  _id: string;
  name: string;
}

interface CartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  image: string;
}

export default function CreateOrderPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    address: "",
    paymentMethod: "COD",
    branch: "",
  });

  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Fetch products and branches on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching products and branches...");
        
        const productsRes = await apiClient.get("/products/all");
        const branchesRes = await apiClient.get("/branches/all");

        console.log("Products response:", productsRes);
        console.log("Branches response:", branchesRes);

        const productsData = Array.isArray(productsRes) ? productsRes : productsRes?.data || [];
        const branchesData = Array.isArray(branchesRes) ? branchesRes : branchesRes?.data || [];

        console.log("Processed products:", productsData);
        console.log("Processed branches:", branchesData);

        setProducts(productsData);
        setBranches(branchesData);
        
        if (productsData.length === 0) {
          console.warn("No products available for user");
        }
        if (branchesData.length === 0) {
          console.warn("No branches available for user");
        }
      } catch (error: any) {
        console.error("Failed to fetch data:", error);
        alert(`Error: ${error?.message || "Failed to load products and branches"}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const addToCart = () => {
    if (!selectedProduct || quantity <= 0) {
      alert("Select product and valid quantity");
      return;
    }

    const product = products.find((p) => p._id === selectedProduct);
    if (!product) return;

    // Check if product already in cart
    const existingItem = cart.find((item) => item.productId === selectedProduct);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.productId === selectedProduct
            ? { ...item, qty: item.qty + quantity }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          productId: selectedProduct,
          name: product.name,
          price: product.price,
          qty: quantity,
          image: product.image,
        },
      ]);
    }

    setSelectedProduct("");
    setQuantity(1);
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(
      cart.map((item) =>
        item.productId === productId ? { ...item, qty: newQty } : item
      )
    );
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Add at least one product to order");
      return;
    }

    if (!form.branch) {
      alert("Select branch");
      return;
    }

    try {
      await apiClient.post("/orders/create", {
        customerName: form.customerName,
        phone: form.phone,
        address: form.address,
        paymentMethod: form.paymentMethod,
        products: cart.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          qty: item.qty,
          image: item.image,
        })),
        totalAmount,
        branch: form.branch,
      });

      alert("Order created ✅");
      router.push("/dashboard/orders");
    } catch (error) {
      alert((error as Error).message || "Failed to create order");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">Create New Order</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1 dark:text-gray-300">Customer Name *</label>
            <input
              type="text"
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              className="w-full border rounded p-2 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1 dark:text-gray-300">Phone *</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full border rounded p-2 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm mb-1 dark:text-gray-300">Address *</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full border rounded p-2 dark:bg-gray-700 dark:text-white"
              rows={2}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1 dark:text-gray-300">Payment Method *</label>
            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
              className="w-full border rounded p-2 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="COD">Cash on Delivery</option>
              <option value="Card">Card</option>
              <option value="Bank">Bank Transfer</option>
              <option value="Online">Online Payment</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1 dark:text-gray-300">Branch *</label>
            <select
              name="branch"
              value={form.branch}
              onChange={handleChange}
              className="w-full border rounded p-2 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Select Branch</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Section */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">Add Products</h2>

          <div className="flex gap-2 mb-4">
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="flex-1 border rounded p-2 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select Product</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} - Rs. {p.price}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-20 border rounded p-2 dark:bg-gray-700 dark:text-white"
              placeholder="Qty"
            />

            <button
              type="button"
              onClick={addToCart}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
            >
              <FiPlus /> Add
            </button>
          </div>

          {/* Cart Items */}
          {cart.length > 0 && (
            <div className="space-y-2 mb-4">
              <h3 className="font-semibold dark:text-white">Order Items</h3>
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded"
                >
                  <div className="flex-1">
                    <p className="font-medium dark:text-white">{item.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Rs. {item.price} × {item.qty} = Rs. {item.price * item.qty}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
                      className="w-12 border rounded p-1 dark:bg-gray-600 dark:text-white"
                    />

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.productId)}
                      className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900 p-2 rounded"
                    >
                      <FiX />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Total */}
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded border border-blue-200 dark:border-blue-700">
          <div className="flex justify-between text-lg font-bold dark:text-white">
            <span>Total Amount:</span>
            <span>Rs. {totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Create Order
          </button>

          <Link
            href="/dashboard/orders"
            className="bg-gray-300 text-black px-6 py-2 rounded hover:bg-gray-400 inline-block"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
