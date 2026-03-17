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

    console.log("Fetching inventory for supplier:", supplierId);

    // SIMPLE QUERY - Get ALL medicines for this supplier
    const medicines = await pool.query(
      `SELECT 
        medicine_id,
        name as medicine_name,
        category,
        description,
        price,
        stock,
        expiry_date,
        image_url
       FROM medicines
       WHERE supplier_id = $1
       ORDER BY name`,
      [supplierId]
    );

    console.log(`Found ${medicines.rows.length} medicines in medicines table`);

    // Get inventory data
    const inventory = await pool.query(
      `SELECT * FROM supplier_inventory WHERE supplier_id = $1`,
      [supplierId]
    );

    // Create a map of inventory data
    const inventoryMap = {};
    inventory.rows.forEach(item => {
      inventoryMap[item.medicine_id] = item;
    });

    // Combine the data
    const result = medicines.rows.map(medicine => {
      const inv = inventoryMap[medicine.medicine_id];
      return {
        inventory_id: inv ? inv.inventory_id : 0,
        medicine_id: medicine.medicine_id,
        medicine_name: medicine.medicine_name,
        category: medicine.category,
        description: medicine.description,
        image_url: medicine.image_url,
        quantity_available: inv ? inv.quantity_available : 0,
        reorder_level: inv ? inv.reorder_level : 20,
        purchase_price: inv ? parseFloat(inv.purchase_price) : parseFloat(medicine.price),
        selling_price: inv ? parseFloat(inv.selling_price) : parseFloat(medicine.price),
        expiry_date: inv ? inv.expiry_date : medicine.expiry_date
      };
    });

    console.log(`Sending ${result.length} items to frontend`);
    res.json(result);

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

// ✅ FIXED - Now updates BOTH tables
const addToSupplierInventory = async (req, res) => {
  try {
    const { supplierId } = req.params;
    const { medicine_id, quantity_available, reorder_level, purchase_price, selling_price, expiry_date } = req.body;

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Check if already in inventory
      const existing = await client.query(
        `SELECT * FROM supplier_inventory
         WHERE supplier_id = $1 AND medicine_id = $2`,
        [supplierId, medicine_id]
      );

      if (existing.rows.length > 0) {
        // Update existing inventory
        await client.query(
          `UPDATE supplier_inventory
           SET quantity_available = quantity_available + $1,
               reorder_level = COALESCE($2, reorder_level),
               purchase_price = COALESCE($3, purchase_price),
               selling_price = COALESCE($4, selling_price),
               expiry_date = COALESCE($5, expiry_date),
               updated_at = NOW()
           WHERE supplier_id = $6 AND medicine_id = $7`,
          [quantity_available, reorder_level, purchase_price, selling_price, expiry_date, supplierId, medicine_id]
        );
      } else {
        // Insert new inventory
        await client.query(
          `INSERT INTO supplier_inventory
           (supplier_id, medicine_id, quantity_available, reorder_level, purchase_price, selling_price, expiry_date)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [supplierId, medicine_id, quantity_available, reorder_level || 20, purchase_price || 0, selling_price, expiry_date]
        );
      }

      // Update medicines table
      await client.query(
        `UPDATE medicines
         SET stock = stock + $1,
             price = COALESCE($2, price),
             expiry_date = COALESCE($3, expiry_date),
             updated_at = NOW()
         WHERE medicine_id = $4`,
        [quantity_available, selling_price, expiry_date, medicine_id]
      );

      await client.query('COMMIT');
      
      // Return success
      res.status(201).json({ 
        success: true, 
        message: "Medicine added to inventory successfully" 
      });

    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Error adding to inventory:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ NEW - Add completely new medicine
const addNewMedicineToInventory = async (req, res) => {
  const { supplierId } = req.params;
  const { 
    medicine_name, 
    category, 
    description, 
    quantity_available, 
    reorder_level, 
    purchase_price, 
    selling_price, 
    expiry_date, 
    image_url 
  } = req.body;

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Insert into medicines
    const newMedicine = await client.query(
      `INSERT INTO medicines 
       (supplier_id, name, category, description, price, stock, expiry_date, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING medicine_id`,
      [supplierId, medicine_name, category, description, selling_price, quantity_available, expiry_date, image_url]
    );
    
    const medicineId = newMedicine.rows[0].medicine_id;

    // Insert into supplier_inventory
    await client.query(
      `INSERT INTO supplier_inventory 
       (supplier_id, medicine_id, quantity_available, reorder_level, purchase_price, selling_price, expiry_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [supplierId, medicineId, quantity_available, reorder_level || 20, purchase_price || 0, selling_price, expiry_date]
    );

    await client.query('COMMIT');
    
    res.status(201).json({ 
      success: true, 
      message: "New medicine added successfully",
      medicine_id: medicineId 
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error adding new medicine:", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

const updateInventoryItem = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    const { quantity_available, reorder_level, purchase_price, selling_price, expiry_date } = req.body;

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get medicine_id
      const inventoryItem = await client.query(
        `SELECT medicine_id, supplier_id FROM supplier_inventory WHERE inventory_id = $1`,
        [inventoryId]
      );

      if (inventoryItem.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: "Inventory item not found" });
      }

      const { medicine_id } = inventoryItem.rows[0];

      // Update supplier_inventory
      await client.query(
        `UPDATE supplier_inventory
         SET quantity_available = $1,
             reorder_level = $2,
             purchase_price = $3,
             selling_price = $4,
             expiry_date = $5,
             updated_at = NOW()
         WHERE inventory_id = $6`,
        [quantity_available, reorder_level, purchase_price, selling_price, expiry_date, inventoryId]
      );

      // Update medicines
      await client.query(
        `UPDATE medicines
         SET stock = $1,
             price = $2,
             expiry_date = $3,
             updated_at = NOW()
         WHERE medicine_id = $4`,
        [quantity_available, selling_price, expiry_date, medicine_id]
      );

      await client.query('COMMIT');
      res.json({ success: true, message: "Inventory updated successfully" });

    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
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
  addNewMedicineToInventory,
  updateInventoryItem,
  deleteInventoryItem
};