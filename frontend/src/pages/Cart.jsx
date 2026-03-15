// pages/Cart.jsx
import React from "react";
import { useCart } from "../hooks/useCart";
import { useNotification } from "../contexts/NotificationContext";
import authService from "../services/authService";

function Cart() {
  const { cart, loading, updateQuantity, removeFromCart, calculateTotal } = useCart();
  const { showNotification } = useNotification();
  const user = authService.getCurrentUser();

  if (!user) {
    return <p className="text-center mt-10 text-gray-700">Please login to view your cart.</p>;
  }

  if (loading) {
    return <p className="text-center mt-10 text-gray-700">Loading cart...</p>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">Your Shopping Cart</h2>

      {cart.length === 0 ? (
        <p className="text-center text-gray-600">Your cart is empty.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cart.map((item) => (
            <div
              key={item.cart_item_id}
              className="bg-white shadow-lg rounded-xl p-5 flex flex-col items-center"
            >
              <img
                src={
                  item.image_url ||
                  "https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/default-medicine.jpg"
                }
                alt={item.name}
                className="w-32 h-32 object-cover rounded-md mb-4"
              />
              <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
              <p className="text-sm text-gray-600">Category: {item.category}</p>
              <p className="text-gray-700 font-bold mt-2">Rs. {item.price}</p>

              <div className="flex items-center mt-2">
                <button
                  className="bg-gray-200 px-2 py-1 rounded-l hover:bg-gray-300"
                  onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                >
                  -
                </button>
                <span className="px-4">{item.quantity}</span>
                <button
                  className="bg-gray-200 px-2 py-1 rounded-r hover:bg-gray-300"
                  onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                >
                  +
                </button>
              </div>

              <button
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                onClick={() => removeFromCart(item.cart_item_id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Cart;