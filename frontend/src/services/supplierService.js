// services/supplierService.js
import api from './api';

class SupplierService {
  async getStockRequests(supplierId) {
    return api.get(`/api/supplier/${supplierId}/stock-requests`);
  }

  async acceptRequest(requestId) {
    return api.put(`/api/stock-requests/${requestId}/accept`, {});
  }

  async rejectRequest(requestId) {
    return api.put(`/api/stock-requests/${requestId}/reject`, {});
  }

  async shipOrder(requestId, trackingInfo = '') {
    return api.put(`/api/stock-requests/${requestId}/ship`, { tracking_info: trackingInfo });
  }

  async markDelivered(requestId) {
    return api.put(`/api/stock-requests/${requestId}/deliver`, {});
  }
}

export default new SupplierService();