// routes/prescriptionRoutes.js
const express = require('express');
const router = express.Router();
const { 
  uploadPrescription,
  getUserPrescriptions,
  updatePrescription,
  deletePrescription,
  getPatientPrescriptions,
  verifyPrescription,
  createDoctorPrescription
} = require('../controllers/prescriptionController');

router.post("/api/prescriptions", uploadPrescription);
router.get("/api/prescriptions/:userId", getUserPrescriptions);
router.put("/api/prescriptions/:prescriptionId", updatePrescription);
router.delete("/api/prescriptions/:prescriptionId", deletePrescription);
router.get("/api/patient/:patientId/prescriptions", getPatientPrescriptions);
router.put("/api/doctor/verify-prescription/:prescriptionId", verifyPrescription);
router.post("/api/doctor/prescriptions", createDoctorPrescription);

module.exports = router;