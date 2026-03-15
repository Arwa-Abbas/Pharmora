// controllers/orderController.js
const { pool } = require('../config/database');

const createOrder = async (req, res) => {
  const { user_id, prescription_id, items, total_price, delivery_address, pharmacist_id } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const orderResult = await client.query(
      `INSERT INTO orders (user_id, prescription_id, order_date, total_price, status, delivery_address, pharmacist_id)
       VALUES ($1, $2, NOW(), $3, 'Pending', $4, $5) RETURNING *`,
      [user_id, prescription_id || null, total_price, delivery_address, pharmacist_id || null]
    );

    const orderId = orderResult.rows[0].order_id;

    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, medicine_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.medicine_id, item.quantity, item.price]
      );

      await client.query(
        `UPDATE medicines SET stock = stock - $1 WHERE medicine_id = $2`,
        [item.quantity, item.medicine_id]
      );
    }

    await client.query("DELETE FROM cart_items WHERE user_id = $1", [user_id]);

    await client.query('COMMIT');
    res.status(201).json(orderResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error creating order:", err);
    res.status(500).json({ error: "Failed to create order" });
  } finally {
    client.release();
  }
};

const getUserOrders = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT o.*,
              CONCAT(ph.first_name, ' ', ph.last_name) as pharmacist_name,
              pharm.pharmacy_name,
              json_agg(json_build_object(
                'medicine_name', m.name,
                'quantity', oi.quantity,
                'price', oi.price,
                'image_url', m.image_url
              )) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.order_id = oi.order_id
       LEFT JOIN medicines m ON oi.medicine_id = m.medicine_id
       LEFT JOIN users ph ON o.pharmacist_id = ph.user_id
       LEFT JOIN pharmacists pharm ON o.pharmacist_id = pharm.user_id
       WHERE o.user_id = $1
       GROUP BY o.order_id, ph.first_name, ph.last_name, pharm.pharmacy_name
       ORDER BY o.order_date DESC`,
      [userId]
    );

    res.json(result.rows.map(order => ({ ...order, prescription_id: order.prescription_id || null })));
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

const getOrdersWithoutPrescriptions = async (req, res) => {
  const { patientId } = req.params;
  const { excludePrescriptionId } = req.query;

  try {
    let query = `
      SELECT o.*
      FROM orders o
      WHERE o.user_id = $1
      AND (o.prescription_id IS NULL OR o.prescription_id = 0)
    `;
    let params = [patientId];

    if (excludePrescriptionId) {
      query = `
        SELECT o.*
        FROM orders o
        WHERE o.user_id = $1
        AND (o.prescription_id IS NULL OR o.prescription_id = 0 OR o.prescription_id = $2)
      `;
      params = [patientId, excludePrescriptionId];
    }

    query += ` ORDER BY o.order_date DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching orders without prescriptions:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const allowed = ['Pending', 'Processing', 'Verified', 'Shipped', 'Delivered', 'Cancelled'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    const result = await pool.query(
      `UPDATE orders SET status = $1 WHERE order_id = $2 RETURNING *`,
      [status, orderId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

const cancelOrder = async (req, res) => {
  const { orderId } = req.params;
  const { reason } = req.body;

  try {
    const result = await pool.query(
      `UPDATE orders SET status = 'Cancelled', cancellation_reason = $1 WHERE order_id = $2 RETURNING *`,
      [reason || null, orderId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error cancelling order:', err);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
};

const shipOrder = async (req, res) => {
  const { orderId } = req.params;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const itemsResult = await client.query(
      `SELECT oi.medicine_id, oi.quantity, m.name, m.stock
       FROM order_items oi
       JOIN medicines m ON oi.medicine_id = m.medicine_id
       WHERE oi.order_id = $1`,
      [orderId]
    );

    if (itemsResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Order not found' });
    }

    const insufficient = itemsResult.rows.filter(item => item.stock < item.quantity);
    if (insufficient.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'Insufficient stock',
        items: insufficient.map(i => ({
          name: i.name,
          available: i.stock,
          required: i.quantity
        }))
      });
    }

    for (const item of itemsResult.rows) {
      await client.query(
        `UPDATE medicines SET stock = stock - $1 WHERE medicine_id = $2`,
        [item.quantity, item.medicine_id]
      );
    }

    const result = await client.query(
      `UPDATE orders SET status = 'Shipped' WHERE order_id = $1 RETURNING *`,
      [orderId]
    );

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error shipping order:', err);
    res.status(500).json({ error: 'Failed to ship order' });
  } finally {
    client.release();
  }
};

const getPharmacistOrders = async (req, res) => {
  const { pharmacistId } = req.params;
  try {
    const result = await pool.query(
      `SELECT o.*,
              CONCAT(u.first_name, ' ', u.last_name) as patient_name,
              u.phone as patient_phone,
              p.prescription_id,
              p.status as prescription_status,
              p.diagnosis,
              json_agg(json_build_object(
                'medicine_name', m.name,
                'quantity', oi.quantity,
                'price', oi.price,
                'image_url', m.image_url
              )) as items
       FROM orders o
       JOIN users u ON o.user_id = u.user_id
       LEFT JOIN order_items oi ON o.order_id = oi.order_id
       LEFT JOIN medicines m ON oi.medicine_id = m.medicine_id
       LEFT JOIN prescriptions p ON o.prescription_id = p.prescription_id
       WHERE o.pharmacist_id = $1
       GROUP BY o.order_id, u.first_name, u.last_name, u.phone,
                p.prescription_id, p.status, p.diagnosis
       ORDER BY o.order_date DESC`,
      [pharmacistId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching pharmacist orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrdersWithoutPrescriptions,
  updateOrderStatus,
  cancelOrder,
  shipOrder,
  getPharmacistOrders
};
