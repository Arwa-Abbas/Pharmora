// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getUserPayments,
  createPayment 
} = require('../controllers/paymentController');

router.get("/api/payments/:userId", getUserPayments);
router.post("/api/payments", createPayment);

module.exports = router;