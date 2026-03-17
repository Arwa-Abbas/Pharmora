
const express = require('express');
const router = express.Router();
const { 
  getAllMedicines, 
  getMedicinesForForm,
  addMedicine,
  getAvailableMedicines 
} = require('../controllers/medicineController');

router.get("/medicines", getAllMedicines);
router.get("/api/medicines", getMedicinesForForm);
router.post("/medicines", addMedicine);
router.get("/api/medicines/available", getAvailableMedicines);

module.exports = router;