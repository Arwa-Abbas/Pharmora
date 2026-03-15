// services/orderService.js
import api from './api';

class OrderService {
  async createOrder(orderData) {
    return api.post('/api/orders', orderData);
  }

  async getUserOrders(userId) {
    return api.get(`/api/orders/${userId}`);
  }

  async getOrdersWithoutPrescriptions(patientId, excludePrescriptionId = null) {
    let url = `/api/patient/${patientId}/orders-without-prescriptions`;
    if (excludePrescriptionId) {
      url += `?excludePrescriptionId=${excludePrescriptionId}`;
    }
    return api.get(url);
  }
}

export default new OrderService();