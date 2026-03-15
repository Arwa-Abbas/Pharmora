// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById } = require('../controllers/userController');
const { authenticateAdmin } = require('../middleware/adminAuth');

router.get("/api/users", authenticateAdmin, getAllUsers);
router.get("/api/users/:userId", getUserById);

module.exports = router;