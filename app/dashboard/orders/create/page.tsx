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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const productsRes = await apiClient.get("/products/all");
        const branchesRes = await apiClient.get("/branches/all");

        const productsData = Array.isArray(productsRes) ? productsRes : productsRes?.data || [];
        const branchesData = Array.isArray(branchesRes) ? branchesRes : branchesRes?.data || [];

        setProducts(productsData);
        setBranches(branchesData);
      } catch (error: any) {
        alert(`Error: ${error?.message || "Failed to load products and branches"}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addToCart = () => {
    if (!selectedProduct || quantity <= 0) {
      alert("Select product and valid quantity");
      return;
    }
    const product = products.find((p) => p._id === selectedProduct);
    if (!product) return;

    const existingItem = cart.find((item) => item.productId === selectedProduct);
    if (existingItem) {
      setCart(cart.map((item) =>
        item.productId === selectedProduct ? { ...item, qty: item.qty + quantity } : item
      ));
    } else {
      setCart([...cart, {
        productId: selectedProduct,
        name: product.name,
        price: product.price,
        qty: quantity,
        image: product.image,
      }]);
    }
    setSelectedProduct("");
    setQuantity(1);
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) return removeFromCart(productId);
    setCart(cart.map(item => item.productId === productId ? { ...item, qty: newQty } : item));
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return alert("Add at least one product to order");
    if (!form.branch) return alert("Select branch");

    try {
      await apiClient.post("/orders/create", {
        ...form,
        products: cart.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          qty: item.qty,
          image: item.image,
        })),
        totalAmount,
      });
      alert("Order created ✅");
      router.push("/dashboard/orders");
    } catch (error: any) {
      alert(error?.message || "Failed to create order");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">Create New Order</h1>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* CUSTOMER INFO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm dark:text-gray-300">Customer Name *</label>
            <input
              type="text" name="customerName" value={form.customerName} onChange={handleChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm dark:text-gray-300">Phone *</label>
            <input
              type="text" name="phone" value={form.phone} onChange={handleChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block mb-1 text-sm dark:text-gray-300">Address *</label>
            <textarea
              name="address" value={form.address} onChange={handleChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              rows={2} required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm dark:text-gray-300">Payment Method *</label>
            <select
              name="paymentMethod" value={form.paymentMethod} onChange={handleChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="COD">Cash on Delivery</option>
              <option value="Card">Card</option>
              <option value="Bank">Bank Transfer</option>
              <option value="Online">Online Payment</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm dark:text-gray-300">Branch *</label>
            <select
              name="branch" value={form.branch} onChange={handleChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Select Branch</option>
              {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>
        </div>

        {/* PRODUCTS */}
        <div className="border-t pt-4 space-y-4">
          <h2 className="text-lg font-semibold dark:text-white">Add Products</h2>

          <div className="flex flex-col md:flex-row gap-2">
            <select
              value={selectedProduct}
              onChange={e => setSelectedProduct(e.target.value)}
              className="flex-1 p-2 border rounded dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select Product</option>
              {products.map(p => (
                <option key={p._id} value={p._id}>{p.name} - Rs. {p.price}</option>
              ))}
            </select>

            <input
              type="number" min="1" value={quantity}
              onChange={e => setQuantity(Number(e.target.value))}
              className="w-24 p-2 border rounded dark:bg-gray-700 dark:text-white"
            />

            <button
              type="button" onClick={addToCart}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
            >
              <FiPlus /> Add
            </button>
          </div>

          {/* CART */}
          {cart.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold dark:text-white">Order Items</h3>
              <div className="flex flex-col gap-2">
                {cart.map(item => (
                  <div key={item.productId} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    <div className="flex gap-3 items-center mb-2 sm:mb-0">
                      {item.image && <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />}
                      <div>
                        <p className="font-medium dark:text-white">{item.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Rs. {item.price} × {item.qty} = Rs. {item.price * item.qty}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 items-center">
                      <input
                        type="number" min="1" value={item.qty}
                        onChange={e => updateQuantity(item.productId, Number(e.target.value))}
                        className="w-16 p-1 border rounded dark:bg-gray-600 dark:text-white"
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
            </div>
          )}
        </div>

        {/* TOTAL */}
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded border border-blue-200 dark:border-blue-700">
          <div className="flex justify-between text-lg font-bold dark:text-white">
            <span>Total Amount:</span>
            <span>Rs. {totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex flex-col md:flex-row gap-3 pt-4 border-t">
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 w-full md:w-auto">
            Create Order
          </button>
          <Link href="/dashboard/orders" className="bg-gray-300 text-black px-6 py-2 rounded hover:bg-gray-400 w-full md:w-auto text-center">
            Cancel
          </Link>
        </div>

      </form>
    </div>
  );
}
