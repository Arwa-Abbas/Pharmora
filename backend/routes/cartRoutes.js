// routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart 
} = require('../controllers/cartController');

router.get("/api/cart/:userId", getCart);
router.post("/api/cart", addToCart);
router.put("/api/cart/:cartItemId", updateCartItem);
router.delete("/api/cart/:cartItemId", removeFromCart);

module.exports = router;