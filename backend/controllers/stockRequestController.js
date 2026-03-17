
const { pool } = require('../config/database');

const createStockRequest = async (req, res) => {
  const { pharmacist_id, supplier_id, medicine_id, quantity_requested, notes, pharmacy_name } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO stock_requests
       (pharmacist_id, supplier_id, medicine_id, quantity_requested, notes, pharmacy_name, request_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE, 'Pending')
       RETURNING *`,
      [pharmacist_id, supplier_id, medicine_id, quantity_requested, notes || '', pharmacy_name]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating stock request:", err);
    res.status(500).json({ error: err.message });
  }
};

const checkInventory = async (req, res) => {
  const { supplier_id, medicine_id, quantity_requested } = req.body;

  try {
    const inventoryCheck = await pool.query(
      `SELECT * FROM supplier_inventory
       WHERE supplier_id = (SELECT supplier_id FROM suppliers WHERE user_id = $1)
       AND medicine_id = $2`,
      [supplier_id, medicine_id]
    );

    if (inventoryCheck.rows.length === 0) {
      return res.json({
        hasEnough: false,
        available: 0,
        message: "Medicine not found in your inventory. Please add it first."
      });
    }

    const inventory = inventoryCheck.rows[0];

    if (inventory.quantity_available < quantity_requested) {
      return res.json({
        hasEnough: false,
        available: inventory.quantity_available,
        message: `Insufficient stock. Available: ${inventory.quantity_available}, Requested: ${quantity_requested}`
      });
    }

    res.json({
      hasEnough: true,
      available: inventory.quantity_available,
      message: `Sufficient stock available: ${inventory.quantity_available} units`
    });
  } catch (err) {
    console.error("Error checking inventory:", err);
    res.status(500).json({ error: err.message });
  }
};

const acceptRequest = async (req, res) => {
  const { requestId } = req.params;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const reqResult = await client.query(
      `SELECT sr.medicine_id, sr.quantity_requested, sr.supplier_id,
              m.name as medicine_name,
              si.quantity_available
       FROM stock_requests sr
       JOIN medicines m ON sr.medicine_id = m.medicine_id
       LEFT JOIN supplier_inventory si
         ON si.medicine_id = sr.medicine_id
         AND si.supplier_id = (SELECT supplier_id FROM suppliers WHERE user_id = sr.supplier_id)
       WHERE sr.request_id = $1`,
      [requestId]
    );

    if (reqResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "Request not found" });
    }

    const { medicine_id, quantity_requested, supplier_id, medicine_name, quantity_available } = reqResult.rows[0];

    if (quantity_available === null || quantity_available < quantity_requested) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'Insufficient stock',
        item: {
          name: medicine_name,
          available: quantity_available || 0,
          required: quantity_requested
        }
      });
    }

    await client.query(
      `UPDATE supplier_inventory
       SET quantity_available = quantity_available - $1, updated_at = NOW()
       WHERE supplier_id = (SELECT supplier_id FROM suppliers WHERE user_id = $2) AND medicine_id = $3`,
      [quantity_requested, supplier_id, medicine_id]
    );

    await client.query(
      `UPDATE stock_requests SET status = 'Accepted', updated_at = NOW() WHERE request_id = $1`,
      [requestId]
    );

    await client.query(
      `INSERT INTO deliveries (request_id, delivery_status, created_at, updated_at)
       VALUES ($1, 'NotShipped', NOW(), NOW())
       ON CONFLICT (request_id) DO UPDATE
       SET delivery_status = 'NotShipped', updated_at = NOW()`,
      [requestId]
    );

    await client.query('COMMIT');
    res.json({ message: "Request accepted and stock reserved successfully" });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error accepting request:", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

const cancelRequest = async (req, res) => {
  const { requestId } = req.params;
  const { reason } = req.body;

  try {
    const result = await pool.query(
      `UPDATE stock_requests
       SET status = 'Cancelled', rejection_reason = $1, updated_at = NOW()
       WHERE request_id = $2 AND status = 'Pending'
       RETURNING *`,
      [reason || null, requestId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Request not found or not cancellable" });
    }

    res.json({ message: "Request cancelled" });
  } catch (err) {
    console.error("Error cancelling request:", err);
    res.status(500).json({ error: err.message });
  }
};

const rejectRequest = async (req, res) => {
  const { requestId } = req.params;
  const { reason } = req.body;

  try {
    await pool.query(
      `UPDATE stock_requests
       SET status = 'Rejected', rejection_reason = $1, updated_at = NOW()
       WHERE request_id = $2`,
      [reason || null, requestId]
    );

    res.json({ message: "Request rejected" });
  } catch (err) {
    console.error("Error rejecting request:", err);
    res.status(500).json({ error: err.message });
  }
};

const shipOrder = async (req, res) => {
  const { requestId } = req.params;
  const { tracking_info } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const reqResult = await client.query(
      `SELECT medicine_id, quantity_requested, supplier_id FROM stock_requests WHERE request_id = $1`,
      [requestId]
    );

    if (reqResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "Request not found" });
    }

    const deliveryResult = await client.query(
      `UPDATE deliveries
       SET delivery_status = 'Shipped',
           shipped_date = NOW(),
           tracking_info = $1,
           updated_at = NOW()
       WHERE request_id = $2
       RETURNING *`,
      [tracking_info || '', requestId]
    );

    if (deliveryResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "Delivery record not found. Make sure request was accepted first." });
    }

    await client.query('COMMIT');
    res.json({
      message: "Order marked as shipped!",
      delivery_status: 'Shipped'
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error shipping order:", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

const deliverOrder = async (req, res) => {
  const { requestId } = req.params;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const deliveryResult = await client.query(
      `UPDATE deliveries
       SET delivery_status = 'Delivered',
           delivery_date = NOW(),
           updated_at = NOW()
       WHERE request_id = $1
       RETURNING *`,
      [requestId]
    );

    if (deliveryResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "Delivery record not found." });
    }

    await client.query(
      `UPDATE stock_requests SET status = 'Completed', updated_at = NOW() WHERE request_id = $1`,
      [requestId]
    );

    await client.query('COMMIT');
    res.json({ message: "Delivery completed! Pharmacist can now add to their inventory." });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error delivering order:", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

const addToInventory = async (req, res) => {
  const { medicine_id, quantity, supplier_id, request_id } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const supplierInventory = await client.query(
      `SELECT selling_price, expiry_date FROM supplier_inventory
       WHERE supplier_id = $1 AND medicine_id = $2`,
      [supplier_id, medicine_id]
    );

    if (supplierInventory.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "Supplier inventory not found" });
    }

    const { selling_price, expiry_date } = supplierInventory.rows[0];

    await client.query(
      `UPDATE medicines
       SET stock = stock + $1,
           price = $2,
           expiry_date = $3,
           supplier_id = (SELECT user_id FROM suppliers WHERE supplier_id = $5)
       WHERE medicine_id = $4`,
      [quantity, selling_price, expiry_date, medicine_id, supplier_id]
    );

    await client.query(
      `UPDATE stock_requests
       SET status = 'Processed', updated_at = NOW()
       WHERE request_id = $1`,
      [request_id]
    );

    await client.query('COMMIT');

    res.json({
      message: "Medicine added to pharmacy inventory successfully! Price and expiry date updated.",
      added_quantity: quantity,
      new_price: selling_price,
      new_expiry: expiry_date
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error adding to inventory:", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

const getSupplierRequests = async (req, res) => {
  const { supplierId } = req.params;

  try {
    const stockResult = await pool.query(
      `SELECT sr.*,
              m.name as medicine_name,
              m.category,
              m.image_url,
              u.first_name,
              u.last_name,
              u.email as pharmacist_email,
              u.phone as pharmacist_phone,
              p.pharmacy_name
       FROM stock_requests sr
       JOIN medicines m ON sr.medicine_id = m.medicine_id
       JOIN users u ON sr.pharmacist_id = u.user_id
       JOIN pharmacists p ON sr.pharmacist_id = p.user_id
       WHERE sr.supplier_id = (SELECT user_id FROM suppliers WHERE supplier_id = $1)
       ORDER BY sr.request_date DESC`,
      [supplierId]
    );

    const finalResults = [];

    for (const request of stockResult.rows) {
      const deliveryResult = await pool.query(
        `SELECT * FROM deliveries WHERE request_id = $1`,
        [request.request_id]
      );

      const delivery = deliveryResult.rows[0];

      finalResults.push({
        request_id: request.request_id,
        pharmacist_id: request.pharmacist_id,
        supplier_id: request.supplier_id,
        medicine_id: request.medicine_id,
        quantity_requested: request.quantity_requested,
        notes: request.notes,
        pharmacy_name: request.pharmacy_name,
        request_date: request.request_date,
        status: request.status,
        created_at: request.created_at,
        updated_at: request.updated_at,
        medicine_name: request.medicine_name,
        category: request.category,
        image_url: request.image_url,
        pharmacist_name: `${request.first_name || ''} ${request.last_name || ''}`.trim(),
        pharmacist_email: request.pharmacist_email,
        pharmacist_phone: request.pharmacist_phone,
        delivery_status: delivery ? delivery.delivery_status : 'NotShipped',
        delivery_id: delivery ? delivery.delivery_id : null,
        shipped_date: delivery ? delivery.shipped_date : null,
        delivery_date: delivery ? delivery.delivery_date : null,
        tracking_info: delivery ? delivery.tracking_info : null
      });
    }

    res.json(finalResults);
  } catch (err) {
    console.error("Error fetching supplier requests:", err);
    res.status(500).json({ error: err.message });
  }
};

const getPharmacistRequests = async (req, res) => {
  const { pharmacistId } = req.params;

  try {
    const result = await pool.query(
      `SELECT sr.*,
              COALESCE(d.delivery_status, 'NotShipped') as delivery_status,
              d.delivery_id,
              d.shipped_date,
              d.delivery_date,
              d.tracking_info,
              m.name as medicine_name,
              m.category,
              s.company_name as supplier_name,
              s.supplier_id
       FROM stock_requests sr
       JOIN medicines m ON sr.medicine_id = m.medicine_id
       JOIN suppliers s ON sr.supplier_id = s.user_id
       LEFT JOIN deliveries d ON sr.request_id = d.request_id
       WHERE sr.pharmacist_id = $1
       ORDER BY
         CASE
           WHEN sr.status = 'Pending' THEN 1
           WHEN sr.status = 'Accepted' AND COALESCE(d.delivery_status, 'NotShipped') = 'NotShipped' THEN 2
           WHEN COALESCE(d.delivery_status, 'NotShipped') = 'Shipped' THEN 3
           WHEN sr.status = 'Completed' AND COALESCE(d.delivery_status, 'NotShipped') = 'Delivered' THEN 4
           WHEN sr.status = 'Processed' THEN 5
           ELSE 6
         END,
         sr.request_date DESC`,
      [pharmacistId]
    );

    const rowsWithDelivery = result.rows.map(row => ({
      ...row,
      delivery_status: row.delivery_status || 'NotShipped'
    }));

    res.json(rowsWithDelivery);
  } catch (err) {
    console.error("Error fetching pharmacist requests:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createStockRequest,
  checkInventory,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  shipOrder,
  deliverOrder,
  addToInventory,
  getSupplierRequests,
  getPharmacistRequests
};
