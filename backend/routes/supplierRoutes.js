const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const {
  getAllSuppliers,
  getSupplierById,
  updateSupplierProfile,
  getSupplierInventory,
  getSupplierStats,
  addToSupplierInventory,
  addNewMedicineToInventory,  // ← ONLY ADD THIS LINE
  updateInventoryItem,        // ← ONLY ADD THIS LINE
  deleteInventoryItem         // ← ONLY ADD THIS LINE
} = require('../controllers/supplierController');

const { getSupplierRequests } = require('../controllers/stockRequestController');
const { authenticateUser } = require('../middleware/auth');

router.get("/api/suppliers", getAllSuppliers);
router.get("/api/suppliers/:supplierId", getSupplierById);
router.put("/api/suppliers/:supplierId", authenticateUser, updateSupplierProfile);
router.get("/api/suppliers/:supplierId/inventory", authenticateUser, getSupplierInventory);
router.get("/api/suppliers/:supplierId/stats", authenticateUser, getSupplierStats);
router.get("/api/supplier/:supplierId/stock-requests", authenticateUser, getSupplierRequests);

router.get("/api/supplier/user/:userId/medicines", authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      `SELECT si.medicine_id, m.name as medicine_name, m.category, si.quantity_available, si.selling_price
       FROM supplier_inventory si
       JOIN medicines m ON si.medicine_id = m.medicine_id
       JOIN suppliers s ON si.supplier_id = s.supplier_id
       WHERE s.user_id = $1 AND si.quantity_available > 0
       ORDER BY m.name`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching supplier medicines:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/api/supplier/user/:userId", authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT s.*,
              u.first_name,
              u.last_name,
              u.email,
              u.phone,
              u.address
       FROM suppliers s
       JOIN users u ON s.user_id = u.user_id
       WHERE s.user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Supplier not found" });
    }

    const supplier = result.rows[0];
    supplier.name = `${supplier.first_name || ''} ${supplier.last_name || ''}`.trim();

    res.json(supplier);
  } catch (err) {
    console.error("Error fetching supplier:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/api/supplier/:supplierId/stats", authenticateUser, async (req, res) => {
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
});

router.get("/api/supplier/:supplierId/inventory", authenticateUser, async (req, res) => {
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
});

router.post("/api/supplier/:supplierId/inventory", authenticateUser, async (req, res) => {
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
});

// Create a new medicine and add it directly to supplier inventory
router.post("/api/supplier/:supplierId/inventory/new-medicine", authenticateUser, async (req, res) => {
  const { supplierId } = req.params;
  const { medicine_name, category, description, quantity_available, reorder_level, purchase_price, selling_price, expiry_date, image_url } = req.body;

  if (!medicine_name || !category || !quantity_available || !selling_price) {
    return res.status(400).json({ error: "Medicine name, category, quantity, and selling price are required" });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Find or create the medicine
    let medicineId;
    const existing = await client.query(
      `SELECT medicine_id FROM medicines WHERE LOWER(name) = LOWER($1)`,
      [medicine_name.trim()]
    );

    if (existing.rows.length > 0) {
      medicineId = existing.rows[0].medicine_id;
      if (image_url) {
        await client.query(
          `UPDATE medicines SET image_url = $1 WHERE medicine_id = $2`,
          [image_url, medicineId]
        );
      }
    } else {
      // Get supplier's user_id for medicines.supplier_id
      const supplierRow = await client.query(
        `SELECT user_id FROM suppliers WHERE supplier_id = $1`,
        [supplierId]
      );
      const supplierUserId = supplierRow.rows[0]?.user_id || null;

      const medicineResult = await client.query(
        `INSERT INTO medicines (name, category, description, stock, price, supplier_id, image_url)
         VALUES ($1, $2, $3, 0, $4, $5, $6)
         RETURNING medicine_id`,
        [medicine_name.trim(), category, description || '', selling_price, supplierUserId, image_url || null]
      );
      medicineId = medicineResult.rows[0].medicine_id;
    }

    // Upsert into supplier_inventory
    const alreadyInInventory = await client.query(
      `SELECT inventory_id FROM supplier_inventory WHERE supplier_id = $1 AND medicine_id = $2`,
      [supplierId, medicineId]
    );

    if (alreadyInInventory.rows.length > 0) {
      await client.query(
        `UPDATE supplier_inventory
         SET quantity_available = quantity_available + $1,
             selling_price = $2,
             purchase_price = $3,
             expiry_date = $4,
             reorder_level = $5,
             updated_at = NOW()
         WHERE supplier_id = $6 AND medicine_id = $7`,
        [quantity_available, selling_price, purchase_price || 0, expiry_date || null, reorder_level || 20, supplierId, medicineId]
      );
    } else {
      await client.query(
        `INSERT INTO supplier_inventory
         (supplier_id, medicine_id, quantity_available, reorder_level, purchase_price, selling_price, expiry_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [supplierId, medicineId, quantity_available, reorder_level || 20, purchase_price || 0, selling_price, expiry_date || null]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ message: "Medicine added to inventory successfully", medicine_id: medicineId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error adding new medicine to inventory:", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.put("/api/supplier/inventory/:inventoryId", authenticateUser, async (req, res) => {
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
});

router.delete("/api/supplier/inventory/:inventoryId", authenticateUser, async (req, res) => {
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
});

module.exports = router;