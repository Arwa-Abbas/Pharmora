// services/prescriptionService.js
import api from './api';

class PrescriptionService {
  async uploadPrescription(data) {
    return api.post('/api/prescriptions', data);
  }

  async getUserPrescriptions(userId) {
    return api.get(`/api/prescriptions/${userId}`);
  }

  async updatePrescription(prescriptionId, data) {
    return api.put(`/api/prescriptions/${prescriptionId}`, data);
  }

  async deletePrescription(prescriptionId) {
    return api.delete(`/api/prescriptions/${prescriptionId}`);
  }

  async getPendingPrescriptions(doctorId) {
    return api.get(`/api/doctor/pending-prescriptions/${doctorId}`);
  }

  async verifyPrescription(prescriptionId, doctorId, status, notes = '') {
    return api.put(`/api/doctor/verify-prescription/${prescriptionId}`, {
      doctor_id: doctorId,
      status,
      notes
    });
  }

  async createDoctorPrescription(data) {
    return api.post('/api/doctor/prescriptions', data);
  }

  async getDoctorPrescriptions(patientId) {
    return api.get(`/api/patient/${patientId}/prescriptions`);
  }
}

export default new PrescriptionService();