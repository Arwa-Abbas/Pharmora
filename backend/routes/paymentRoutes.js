
const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const {
  getUserPayments,
  createPayment
} = require('../controllers/paymentController');

router.get("/api/payments/:userId", authenticateUser, getUserPayments);
router.post("/api/payments", authenticateUser, createPayment);

module.exports = router;
