// services/doctorService.js
import api from './api';

class DoctorService {
  async getPrescriptions(doctorId) {
    return api.get(`/api/doctor/${doctorId}/prescriptions`);
  }

  async getPatients(doctorId) {
    return api.get(`/api/doctor/${doctorId}/patients`);
  }

  async getAllPatientsForDropdown(doctorId) {
    return api.get(`/api/doctor/${doctorId}/all-patients`);
  }

  async getStats(doctorId) {
    return api.get(`/api/doctor/${doctorId}/stats`);
  }

  async getSpecialty(doctorId) {
    return api.get(`/api/doctor/${doctorId}/specialty`);
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

  async createPrescription(data) {
    return api.post('/api/doctor/prescriptions', data);
  }

  async assignPatient(doctorId, patientId) {
    return api.put(`/api/doctor/${doctorId}/assign-patient/${patientId}`, {});
  }
}

export default new DoctorService();