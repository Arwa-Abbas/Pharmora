// services/cartService.js
import api from './api';

class CartService {
  async getCart(userId) {
    return api.get(`/api/cart/${userId}`);
  }

  async addToCart(userId, medicineId, quantity = 1) {
    return api.post('/api/cart', {
      user_id: userId,
      medicine_id: medicineId,
      quantity
    });
  }

  async updateQuantity(cartItemId, quantity) {
    return api.put(`/api/cart/${cartItemId}`, { quantity });
  }

  async removeItem(cartItemId) {
    return api.delete(`/api/cart/${cartItemId}`);
  }
}

export default new CartService();