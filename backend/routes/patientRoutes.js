// routes/patientRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getAllPatients,
  getPatientById,
  updatePatientProfile,
  getPatientPrescriptions,
  getPatientOrders
} = require('../controllers/patientController');

router.get("/api/patients", getAllPatients);
router.get("/api/patients/:patientId", getPatientById);
router.put("/api/patients/:patientId", updatePatientProfile);
router.get("/api/patients/:patientId/prescriptions", getPatientPrescriptions);
router.get("/api/patients/:patientId/orders", getPatientOrders);

module.exports = router;