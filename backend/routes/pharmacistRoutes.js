// routes/pharmacistRoutes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

router.get("/api/pharmacists", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
          p.pharmacist_id,
          p.user_id,
          p.pharmacy_name,
          p.pharmacy_license,
          u.first_name,
          u.last_name,
          u.email,
          u.phone,
          u.address,
          u.city,
          u.country
       FROM pharmacists p
       JOIN users u ON p.user_id = u.user_id
       WHERE u.role = 'Pharmacist'
       ORDER BY u.first_name, u.last_name`
    );

    const formattedPharmacists = result.rows.map(row => ({
      user_id: row.user_id,
      pharmacist_id: row.pharmacist_id,
      first_name: row.first_name,
      last_name: row.last_name,
      full_name: `${row.first_name || ''} ${row.last_name || ''}`.trim(),
      email: row.email,
      phone: row.phone,
      address: row.address,
      city: row.city,
      country: row.country,
      pharmacy_name: row.pharmacy_name,
      pharmacy_license: row.pharmacy_license
    }));

    res.json(formattedPharmacists);
  } catch (err) {
    console.error("Error fetching pharmacists:", err);
    res.status(500).json({ error: "Failed to fetch pharmacists: " + err.message });
  }
});

router.get("/api/pharmacist/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT p.*, u.first_name, u.last_name, u.email, u.phone, u.address
       FROM pharmacists p
       JOIN users u ON p.user_id = u.user_id
       WHERE p.user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Pharmacist not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching pharmacist:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/api/pharmacist/:pharmacistId/stats", async (req, res) => {
  try {
    const { pharmacistId } = req.params;

    const medicinesResult = await pool.query(
      `SELECT COUNT(*) as count FROM medicines`
    );

    const pendingResult = await pool.query(
      `SELECT COUNT(*) as count FROM stock_requests
       WHERE pharmacist_id = $1 AND status = 'Pending'`,
      [pharmacistId]
    );

    const completedResult = await pool.query(
      `SELECT COUNT(*) as count FROM stock_requests
       WHERE pharmacist_id = $1 AND status = 'Completed'`,
      [pharmacistId]
    );

    const lowStockResult = await pool.query(
      `SELECT COUNT(*) as count FROM medicines WHERE stock < 10`
    );

    res.json({
      total_medicines: parseInt(medicinesResult.rows[0].count) || 0,
      pending_requests: parseInt(pendingResult.rows[0].count),
      completed_deliveries: parseInt(completedResult.rows[0].count),
      low_stock_medicines: parseInt(lowStockResult.rows[0].count) || 0
    });
  } catch (err) {
    console.error("Error fetching pharmacist stats:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/api/pharmacist/medicines", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        m.medicine_id,
        m.supplier_id,
        m.name,
        m.category,
        m.description,
        m.price,
        m.stock,
        m.expiry_date,
        m.image_url,
        s.company_name as supplier_name
       FROM medicines m
       JOIN suppliers s ON m.supplier_id = s.supplier_id
       ORDER BY m.name`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching medicines:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
