// routes/doctorRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getAllDoctors,
  getDoctorById,
  updateDoctorProfile,
  getDoctorPatients,
  assignPatient
} = require('../controllers/doctorController');

router.get("/api/doctors", getAllDoctors);
router.get("/api/doctors/:doctorId", getDoctorById);
router.put("/api/doctors/:doctorId", updateDoctorProfile);
router.get("/api/doctors/:doctorId/patients", getDoctorPatients);
router.put("/api/doctors/:doctorId/assign-patient/:patientId", assignPatient);

module.exports = router;