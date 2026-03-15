// routes/index.js
const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const doctorRoutes = require('./doctorRoutes');
const pharmacistRoutes = require('./pharmacistRoutes');
const supplierRoutes = require('./supplierRoutes');
const patientRoutes = require('./patientRoutes');
const medicineRoutes = require('./medicineRoutes');
const cartRoutes = require('./cartRoutes');
const orderRoutes = require('./orderRoutes');
const prescriptionRoutes = require('./prescriptionRoutes');
const paymentRoutes = require('./paymentRoutes');
const stockRequestRoutes = require('./stockRequestRoutes');
const adminRoutes = require('./adminRoutes');

router.use('/', authRoutes);
router.use('/', userRoutes);
router.use('/', doctorRoutes);
router.use('/', pharmacistRoutes);
router.use('/', supplierRoutes);
router.use('/', patientRoutes);
router.use('/', medicineRoutes);
router.use('/', cartRoutes);
router.use('/', orderRoutes);
router.use('/', prescriptionRoutes);
router.use('/', paymentRoutes);
router.use('/', stockRequestRoutes);
router.use('/', adminRoutes);

module.exports = router;