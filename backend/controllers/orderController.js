// controllers/orderController.js
const { pool } = require('../config/database');

const createOrder = async (req, res) => {
  const { user_id, prescription_id, items, total_price, delivery_address } = req.body;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const orderResult = await client.query(
      `INSERT INTO orders (user_id, prescription_id, order_date, total_price, status, delivery_address)
       VALUES ($1, $2, NOW(), $3, 'Pending', $4) RETURNING *`,
      [user_id, prescription_id || null, total_price, delivery_address]
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
              json_agg(json_build_object(
                'medicine_name', m.name,
                'quantity', oi.quantity,
                'price', oi.price,
                'image_url', m.image_url
              )) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.order_id = oi.order_id
       LEFT JOIN medicines m ON oi.medicine_id = m.medicine_id
       WHERE o.user_id = $1
       GROUP BY o.order_id
       ORDER BY o.order_date DESC`,
      [userId]
    );
    
    const ordersWithPrescription = result.rows.map(order => ({
      ...order,
      prescription_id: order.prescription_id || null
    }));
    
    res.json(ordersWithPrescription);
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

module.exports = {
  createOrder,
  getUserOrders,
  getOrdersWithoutPrescriptions
};