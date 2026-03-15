// routes/doctorRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const {
  getAllDoctors,
  getDoctorById,
  updateDoctorProfile,
  getDoctorPatients,
  assignPatient,
  getDoctorSpecialty,
  getDoctorStats,
  getDoctorPrescriptions,
  getDoctorPendingPrescriptions,
  getDoctorAllPatients
} = require('../controllers/doctorController');

router.get("/api/doctors", getAllDoctors);
router.get("/api/doctors/:doctorId", getDoctorById);
router.put("/api/doctors/:doctorId", authenticateUser, updateDoctorProfile);
router.get("/api/doctors/:doctorId/patients", authenticateUser, getDoctorPatients);
router.put("/api/doctors/:doctorId/assign-patient/:patientId", authenticateUser, assignPatient);

router.get("/api/doctor/:doctorId/specialty", authenticateUser, getDoctorSpecialty);
router.get("/api/doctor/:doctorId/stats", authenticateUser, getDoctorStats);
router.get("/api/doctor/:doctorId/prescriptions", authenticateUser, getDoctorPrescriptions);
router.get("/api/doctor/pending-prescriptions/:doctorId", authenticateUser, getDoctorPendingPrescriptions);
router.get("/api/doctor/:doctorId/all-patients", authenticateUser, getDoctorAllPatients);
router.get("/api/doctor/:doctorId/patients", authenticateUser, getDoctorPatients);
router.put("/api/doctor/:doctorId/assign-patient/:patientId", authenticateUser, assignPatient);

module.exports = router;
