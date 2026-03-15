// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  getUserOrders,
  getOrdersWithoutPrescriptions 
} = require('../controllers/orderController');

router.post("/api/orders", createOrder);
router.get("/api/orders/:userId", getUserOrders);
router.get("/api/patient/:patientId/orders-without-prescriptions", getOrdersWithoutPrescriptions);

module.exports = router;