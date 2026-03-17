
import api from './api';

class MedicineService {
  async getAllMedicines() {
    return api.get('/medicines');
  }

  async getAvailableMedicines() {
    return api.get('/api/medicines/available');
  }

  async getMedicinesForPrescription() {
    return api.get('/api/medicines');
  }

  async addMedicine(data) {
    return api.post('/medicines', data);
  }
}

export default new MedicineService();