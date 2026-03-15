// controllers/paymentController.js
const { pool } = require('../config/database');

const getUserPayments = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT p.*, o.order_date
       FROM payment p
       JOIN orders o ON p.order_id = o.order_id
       WHERE p.user_id = $1
       ORDER BY p.date DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching payments:", err);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
};

const createPayment = async (req, res) => {
  const { order_id, user_id, amount, method, card_last_four } = req.body;
  
  try {
    const existingPayment = await pool.query(
      "SELECT * FROM payment WHERE order_id = $1",
      [order_id]
    );

    if (existingPayment.rows.length > 0) {
      return res.status(400).json({ error: "Payment already exists for this order" });
    }

    const paymentResult = await pool.query(
      `INSERT INTO payment (order_id, user_id, amount, method, card_last_four, date)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       RETURNING *`,
      [order_id, user_id, amount, method, card_last_four]
    );

    res.status(201).json(paymentResult.rows[0]);
  } catch (err) {
    console.error("Error creating payment:", err);
    res.status(500).json({ error: "Failed to process payment: " + err.message });
  }
};

module.exports = {
  getUserPayments,
  createPayment
};