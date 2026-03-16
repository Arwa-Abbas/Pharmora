// services/pharmacistService.js
import api from './api';

class PharmacistService {
  async getStockRequests(pharmacistId) {
    return api.get(`/api/pharmacist/${pharmacistId}/stock-requests`);
  }

  async createStockRequest(data) {
    return api.post('/api/stock-requests', data);
  }

  async getDeliveredRequests(pharmacistId) {
    return api.get(`/api/pharmacist/${pharmacistId}/delivered-requests`);
  }

  async addToInventory(data) {
    return api.post('/api/pharmacist/add-to-inventory', data);
  }

  async cancelStockRequest(requestId, reason) {
    return api.patch(`/api/stock-requests/${requestId}/cancel`, { reason });
  }
}

export default new PharmacistService();