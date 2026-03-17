
const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const {
  getAllPatients,
  getPatientById,
  updatePatientProfile,
  getPatientPrescriptions,
  getPatientOrders
} = require('../controllers/patientController');

router.get("/api/patients", authenticateUser, getAllPatients);
router.get("/api/patients/:patientId", authenticateUser, getPatientById);
router.put("/api/patients/:patientId", authenticateUser, updatePatientProfile);
router.get("/api/patients/:patientId/prescriptions", authenticateUser, getPatientPrescriptions);
router.get("/api/patients/:patientId/orders", authenticateUser, getPatientOrders);

module.exports = router;
