
const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const {
  uploadPrescription,
  getUserPrescriptions,
  updatePrescription,
  deletePrescription,
  getPatientPrescriptions,
  verifyPrescription,
  createDoctorPrescription
} = require('../controllers/prescriptionController');

router.post("/api/prescriptions", authenticateUser, uploadPrescription);
router.get("/api/prescriptions/:userId", authenticateUser, getUserPrescriptions);
router.put("/api/prescriptions/:prescriptionId", authenticateUser, updatePrescription);
router.delete("/api/prescriptions/:prescriptionId", authenticateUser, deletePrescription);
router.get("/api/patient/:patientId/prescriptions", authenticateUser, getPatientPrescriptions);
router.put("/api/doctor/verify-prescription/:prescriptionId", authenticateUser, verifyPrescription);
router.post("/api/doctor/prescriptions", authenticateUser, createDoctorPrescription);

module.exports = router;
