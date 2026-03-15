// routes/stockRequestRoutes.js
const express = require('express');
const router = express.Router();
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

router.post("/api/stock-requests", createStockRequest);
router.post("/api/supplier/inventory/check", checkInventory);
router.get("/api/pharmacist/:pharmacistId/stock-requests", getPharmacistRequests);
router.get("/api/supplier/:supplierId/stock-requests", getSupplierRequests);
router.put("/api/stock-requests/:requestId/accept", acceptRequest);
router.put("/api/stock-requests/:requestId/reject", rejectRequest);
router.put("/api/stock-requests/:requestId/ship", shipOrder);
router.put("/api/stock-requests/:requestId/deliver", deliverOrder);
router.post("/api/pharmacist/add-to-inventory", addToInventory);

module.exports = router;
