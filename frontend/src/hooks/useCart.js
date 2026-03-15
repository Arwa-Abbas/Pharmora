// hooks/useCart.js
import { useState, useEffect } from 'react';
import cartService from '../services/cartService';
import { useNotification } from '../contexts/NotificationContext';
import authService from '../services/authService';

export const useCart = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const user = authService.getCurrentUser();

  const loadCart = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const data = await cartService.getCart(user.id);
      setCart(data);
    } catch (err) {
      console.error("Error loading cart:", err);
      showNotification("Error loading cart items", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [user]);

  const addToCart = async (medicineId, quantity = 1) => {
    if (!user) {
      showNotification("Please login to add items to cart", "warning");
      return false;
    }

    try {
      await cartService.addToCart(user.id, medicineId, quantity);
      await loadCart();
      showNotification("Item added to cart!", "success");
      return true;
    } catch (err) {
      console.error("Error adding to cart:", err);
      showNotification("Failed to add to cart", "error");
      return false;
    }
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await cartService.updateQuantity(cartItemId, newQuantity);
      await loadCart();
      showNotification("Quantity updated", "success");
    } catch (err) {
      console.error("Error updating quantity:", err);
      showNotification("Error updating quantity", "error");
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await cartService.removeItem(cartItemId);
      await loadCart();
      showNotification("Item removed from cart", "success");
    } catch (err) {
      console.error("Error removing item:", err);
      showNotification("Error removing item from cart", "error");
    }
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  return {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    calculateTotal,
    refreshCart: loadCart
  };
};
