// routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart
} = require('../controllers/cartController');

router.get("/api/cart/:userId", authenticateUser, getCart);
router.post("/api/cart", authenticateUser, addToCart);
router.put("/api/cart/:cartItemId", authenticateUser, updateCartItem);
router.delete("/api/cart/:cartItemId", authenticateUser, removeFromCart);

module.exports = router;
