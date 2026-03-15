// services/adminService.js
import api from './api';

class AdminService {
  async getAllUsers() {
    return api.get('/api/admin/users');
  }

  async getStats() {
    return api.get('/api/admin/stats');
  }

  async getReports(type, format = 'json') {
    return api.get(`/api/admin/reports?type=${type}&format=${format}`);
  }

  async deleteUser(userId) {
    return api.delete(`/api/admin/users/${userId}`);
  }

  async updateUser(userId, data) {
    return api.put(`/api/admin/users/${userId}`, data);
  }

  async createUser(data) {
    return api.post('/api/admin/users', data);
  }

  async getAllPatients() {
    return api.get('/api/admin/patients');
  }

  async getAllDoctors() {
    return api.get('/api/admin/doctors');
  }

  async getAllPharmacists() {
    return api.get('/api/admin/pharmacists');
  }

  async getAllSuppliers() {
    return api.get('/api/admin/suppliers');
  }

  async testSimple() {
    return api.get('/api/admin/test-simple');
  }
}

export default new AdminService();