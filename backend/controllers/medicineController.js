// controllers/medicineController.js
const { pool } = require('../config/database');

const getAllMedicines = async (req, res) => {
  try {
    const query = `
      SELECT medicine_id, supplier_id, name, category, description, price, stock, expiry_date, image_url
      FROM public.medicines
      ORDER BY medicine_id;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching medicines:", err.message);
    res.status(500).json({ error: "Failed to fetch medicines" });
  }
};

const getMedicinesForForm = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT medicine_id, name, category, price
       FROM medicines
       WHERE stock > 0
       ORDER BY name`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching medicines for prescription form:", err);
    res.status(500).json({ error: "Failed to fetch medicines" });
  }
};

const addMedicine = async (req, res) => {
  const { supplier_id, name, category, description, price, stock, expiry_date, image_url } = req.body;
  try {
    const insertQuery = `
      INSERT INTO public.medicines
        (supplier_id, name, category, description, price, stock, expiry_date, image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const { rows } = await pool.query(insertQuery, [
      supplier_id, name, category, description, price, stock, expiry_date, image_url
    ]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error inserting medicine:", err.message);
    res.status(500).json({ error: "Failed to insert medicine" });
  }
};

const getAvailableMedicines = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT medicine_id, name, category, description, image_url
       FROM medicines
       ORDER BY name`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching available medicines:", err);
    res.status(500).json({ error: "Failed to fetch medicines" });
  }
};

module.exports = {
  getAllMedicines,
  getMedicinesForForm,
  addMedicine,
  getAvailableMedicines
};