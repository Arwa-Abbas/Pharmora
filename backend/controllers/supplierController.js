// controllers/supplierController.js
const { pool } = require('../config/database');

const getAllSuppliers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        u.user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.address,
        u.city,
        u.country,
        s.company_name,
        s.supplier_reg_id,
        s.supplier_id
      FROM users u
      JOIN suppliers s ON u.user_id = s.user_id
      WHERE u.role = 'Supplier'
      ORDER BY s.company_name
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching suppliers:", err);
    res.status(500).json({ error: err.message });
  }
};

const getSupplierById = async (req, res) => {
  try {
    const { supplierId } = req.params;

    const result = await pool.query(`
      SELECT
        u.user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.address,
        u.city,
        u.country,
        s.company_name,
        s.supplier_reg_id,
        s.supplier_id
      FROM users u
      JOIN suppliers s ON u.user_id = s.user_id
      WHERE s.supplier_id = $1
    `, [supplierId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Supplier not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching supplier:", err);
    res.status(500).json({ error: err.message });
  }
};

const updateSupplierProfile = async (req, res) => {
  const { supplierId } = req.params;
  const { company_name, contact_number, address } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const supplierResult = await client.query(
      `SELECT user_id FROM suppliers WHERE supplier_id = $1`,
      [supplierId]
    );

    if (supplierResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "Supplier not found" });
    }

    const userId = supplierResult.rows[0].user_id;

    if (contact_number || address) {
      await client.query(
        `UPDATE users
         SET phone = COALESCE($1, phone),
             address = COALESCE($2, address)
         WHERE user_id = $3`,
        [contact_number, address, userId]
      );
    }

    if (company_name) {
      await client.query(
        `UPDATE suppliers
         SET company_name = $1
         WHERE supplier_id = $2`,
        [company_name, supplierId]
      );
    }

    await client.query('COMMIT');

    const updatedSupplier = await client.query(`
      SELECT
        u.user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.address,
        u.city,
        u.country,
        s.company_name,
        s.supplier_reg_id,
        s.supplier_id
      FROM users u
      JOIN suppliers s ON u.user_id = s.user_id
      WHERE s.supplier_id = $1
    `, [supplierId]);

    res.json({
      message: "Supplier details updated successfully",
      supplier: updatedSupplier.rows[0]
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error updating supplier:", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

const getSupplierInventory = async (req, res) => {
  try {
    const { supplierId } = req.params;

    const result = await pool.query(
      `SELECT si.*, m.name as medicine_name, m.category, m.description, m.image_url
       FROM supplier_inventory si
       JOIN medicines m ON si.medicine_id = m.medicine_id
       WHERE si.supplier_id = $1
       ORDER BY m.name`,
      [supplierId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching supplier inventory:", err);
    res.status(500).json({ error: err.message });
  }
};

const getSupplierStats = async (req, res) => {
  try {
    const { supplierId } = req.params;

    const pendingResult = await pool.query(
      `SELECT COUNT(*) FROM stock_requests
       WHERE supplier_id = $1 AND status = 'Pending'`,
      [supplierId]
    );

    const inventoryResult = await pool.query(
      `SELECT
         COUNT(*) as total_items,
         COALESCE(SUM(quantity_available * selling_price), 0) as total_value,
         COUNT(CASE WHEN quantity_available <= reorder_level THEN 1 END) as low_stock_count
       FROM supplier_inventory
       WHERE supplier_id = $1`,
      [supplierId]
    );

    const completedResult = await pool.query(
      `SELECT COUNT(*) FROM stock_requests
       WHERE supplier_id = $1 AND status = 'Completed'`,
      [supplierId]
    );

    res.json({
      pending_requests: parseInt(pendingResult.rows[0].count),
      total_inventory_items: parseInt(inventoryResult.rows[0].total_items || 0),
      total_inventory_value: parseFloat(inventoryResult.rows[0].total_value || 0),
      low_stock_items: parseInt(inventoryResult.rows[0].low_stock_count || 0),
      completed_deliveries: parseInt(completedResult.rows[0].count)
    });
  } catch (err) {
    console.error("Error fetching supplier stats:", err);
    res.status(500).json({ error: err.message });
  }
};

const addToSupplierInventory = async (req, res) => {
  try {
    const { supplierId } = req.params;
    const { medicine_id, quantity_available, reorder_level, purchase_price, selling_price, expiry_date } = req.body;

    const existing = await pool.query(
      `SELECT * FROM supplier_inventory
       WHERE supplier_id = $1 AND medicine_id = $2`,
      [supplierId, medicine_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Medicine already exists in inventory" });
    }

    const result = await pool.query(
      `INSERT INTO supplier_inventory
       (supplier_id, medicine_id, quantity_available, reorder_level, purchase_price, selling_price, expiry_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [supplierId, medicine_id, quantity_available, reorder_level || 20, purchase_price || 0, selling_price, expiry_date]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding to inventory:", err);
    res.status(500).json({ error: err.message });
  }
};

const updateInventoryItem = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    const { quantity_available, reorder_level, purchase_price, selling_price, expiry_date } = req.body;

    const result = await pool.query(
      `UPDATE supplier_inventory
       SET quantity_available = $1,
           reorder_level = $2,
           purchase_price = $3,
           selling_price = $4,
           expiry_date = $5,
           updated_at = NOW()
       WHERE inventory_id = $6
       RETURNING *`,
      [quantity_available, reorder_level, purchase_price, selling_price, expiry_date, inventoryId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Inventory item not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating inventory:", err);
    res.status(500).json({ error: err.message });
  }
};

const deleteInventoryItem = async (req, res) => {
  try {
    const { inventoryId } = req.params;

    const result = await pool.query(
      `DELETE FROM supplier_inventory WHERE inventory_id = $1 RETURNING *`,
      [inventoryId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Inventory item not found" });
    }

    res.json({ message: "Medicine removed from inventory successfully" });
  } catch (err) {
    console.error("Error deleting inventory item:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllSuppliers,
  getSupplierById,
  updateSupplierProfile,
  getSupplierInventory,
  getSupplierStats,
  addToSupplierInventory,
  updateInventoryItem,
  deleteInventoryItem
};
