// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const {
  createOrder,
  getUserOrders,
  getOrdersWithoutPrescriptions,
  updateOrderStatus,
  cancelOrder,
  shipOrder,
  getPharmacistOrders
} = require('../controllers/orderController');

router.post("/api/orders", authenticateUser, createOrder);
router.get("/api/orders/:userId", authenticateUser, getUserOrders);
router.get("/api/patient/:patientId/orders-without-prescriptions", authenticateUser, getOrdersWithoutPrescriptions);
router.patch("/api/orders/:orderId/status", authenticateUser, updateOrderStatus);
router.patch("/api/orders/:orderId/cancel", authenticateUser, cancelOrder);
router.patch("/api/orders/:orderId/ship", authenticateUser, shipOrder);
router.get("/api/pharmacist/:pharmacistId/orders", authenticateUser, getPharmacistOrders);

module.exports = router;
