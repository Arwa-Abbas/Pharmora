// routes/stockRequestRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const {
  createStockRequest,
  checkInventory,
  acceptRequest,
  rejectRequest,
  getPharmacistRequests,
  getSupplierRequests,
  shipOrder,
  deliverOrder,
  addToInventory
} = require('../controllers/stockRequestController');

router.post("/api/stock-requests", authenticateUser, createStockRequest);
router.post("/api/supplier/inventory/check", authenticateUser, checkInventory);
router.get("/api/pharmacist/:pharmacistId/stock-requests", authenticateUser, getPharmacistRequests);
router.get("/api/supplier/:supplierId/stock-requests", authenticateUser, getSupplierRequests);
router.put("/api/stock-requests/:requestId/accept", authenticateUser, acceptRequest);
router.put("/api/stock-requests/:requestId/reject", authenticateUser, rejectRequest);
router.put("/api/stock-requests/:requestId/ship", authenticateUser, shipOrder);
router.put("/api/stock-requests/:requestId/deliver", authenticateUser, deliverOrder);
router.post("/api/pharmacist/add-to-inventory", authenticateUser, addToInventory);

module.exports = router;
