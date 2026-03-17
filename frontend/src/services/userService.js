
import api from './api';

class UserService {
  async getAllUsers() {
    return api.get('/api/users');
  }

  async getUserById(userId) {
    return api.get(`/api/users/${userId}`);
  }

  async getAllDoctors() {
    return api.get('/api/doctors');
  }

  async getDoctorById(doctorId) {
    return api.get(`/api/doctors/${doctorId}`);
  }

  async updateDoctorProfile(doctorId, data) {
    return api.put(`/api/doctors/${doctorId}`, data);
  }

  async getDoctorPatients(doctorId) {
    return api.get(`/api/doctors/${doctorId}/patients`);
  }

  async assignPatient(doctorId, patientId) {
    return api.put(`/api/doctors/${doctorId}/assign-patient/${patientId}`, {});
  }

  async getDoctorStats(doctorId) {
    return api.get(`/api/doctor/${doctorId}/stats`);
  }

  async getDoctorSpecialty(doctorId) {
    return api.get(`/api/doctor/${doctorId}/specialty`);
  }

  async getPendingPrescriptions(doctorId) {
    return api.get(`/api/doctor/pending-prescriptions/${doctorId}`);
  }

  async getDoctorPrescriptions(doctorId) {
    return api.get(`/api/doctor/${doctorId}/prescriptions`);
  }

  async getAllPatientsForDoctor(doctorId) {
    return api.get(`/api/doctor/${doctorId}/all-patients`);
  }

  async getAllPharmacists() {
    return api.get('/api/pharmacists');
  }

  async getPharmacistByUserId(userId) {
    return api.get(`/api/pharmacist/user/${userId}`);
  }

  async updatePharmacistProfile(pharmacistId, data) {
    return api.put(`/api/pharmacists/${pharmacistId}`, data);
  }

  async getPharmacistStats(pharmacistId) {
    return api.get(`/api/pharmacist/${pharmacistId}/stats`);
  }

  async getPharmacistMedicines() {
    return api.get('/api/pharmacist/medicines');
  }

  async getAllSuppliers() {
    return api.get('/api/suppliers');
  }

  async getSupplierByUserId(userId) {
    return api.get(`/api/supplier/user/${userId}`);
  }

  async updateSupplierProfile(supplierId, data) {
    return api.put(`/api/suppliers/${supplierId}`, data);
  }

  async getSupplierInventory(supplierId) {
    return api.get(`/api/supplier/${supplierId}/inventory`);
  }

  async getSupplierStats(supplierId) {
    return api.get(`/api/supplier/${supplierId}/stats`);
  }

  async addToSupplierInventory(supplierId, data) {
    return api.post(`/api/supplier/${supplierId}/inventory`, data);
  }

  async updateInventoryItem(inventoryId, data) {
    return api.put(`/api/supplier/inventory/${inventoryId}`, data);
  }

  async deleteInventoryItem(inventoryId) {
    return api.delete(`/api/supplier/inventory/${inventoryId}`);
  }

  async getAllPatients() {
    return api.get('/api/patients');
  }

  async getPatientById(patientId) {
    return api.get(`/api/patient/${patientId}`);
  }

  async updatePatientProfile(patientId, data) {
    return api.put(`/api/patients/${patientId}`, data);
  }

  async getPatientPrescriptions(patientId) {
    return api.get(`/api/patient/${patientId}/prescriptions`);
  }

  async getPatientOrders(patientId) {
    return api.get(`/api/patient/${patientId}/orders`);
  }
}

export default new UserService();
