// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../middleware/adminAuth');
const {
  getAllUsers,
  getAdminStats,
  getReports,
  deleteUser,
  updateUser,
  createUser,
  testSimple,
  getAllPatients,
  getAllDoctors,
  getAllPharmacists,
  getAllSuppliers
} = require('../controllers/adminController');

router.get("/api/admin/test-simple", testSimple);
router.get("/api/admin/users", authenticateAdmin, getAllUsers);
router.get("/api/admin/stats", authenticateAdmin, getAdminStats);
router.get("/api/admin/reports", authenticateAdmin, getReports);
router.delete("/api/admin/users/:userId", authenticateAdmin, deleteUser);
router.put("/api/admin/users/:userId", authenticateAdmin, updateUser);
router.post("/api/admin/users", authenticateAdmin, createUser);
router.get("/api/admin/patients", authenticateAdmin, getAllPatients);
router.get("/api/admin/doctors", authenticateAdmin, getAllDoctors);
router.get("/api/admin/pharmacists", authenticateAdmin, getAllPharmacists);
router.get("/api/admin/suppliers", authenticateAdmin, getAllSuppliers);

module.exports = router;
