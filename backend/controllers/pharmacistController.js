const { pool } = require('../config/database');

const getAllPharmacists = async (req, res) => {
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
        p.pharmacy_name,
        p.pharmacy_license
      FROM users u
      JOIN pharmacists p ON u.user_id = p.user_id
      WHERE u.role = 'Pharmacist'
      ORDER BY u.first_name, u.last_name
    `);
    
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching pharmacists:", err);
    res.status(500).json({ error: "Failed to fetch pharmacists" });
  }
};

const getPharmacistById = async (req, res) => {
  const { pharmacistId } = req.params;
  
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
        p.pharmacy_name,
        p.pharmacy_license
      FROM users u
      JOIN pharmacists p ON u.user_id = p.user_id
      WHERE u.user_id = $1 AND u.role = 'Pharmacist'
    `, [pharmacistId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Pharmacist not found" });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching pharmacist:", err);
    res.status(500).json({ error: "Failed to fetch pharmacist" });
  }
};

const updatePharmacistProfile = async (req, res) => {
  const { pharmacistId } = req.params;
  const { 
    pharmacy_name, 
    pharmacy_license, 
    phone, 
    address 
  } = req.body;
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');


    await client.query(
      `UPDATE pharmacists 
       SET pharmacy_name = COALESCE($1, pharmacy_name),
           pharmacy_license = COALESCE($2, pharmacy_license)
       WHERE user_id = $3`,
      [pharmacy_name, pharmacy_license, pharmacistId]
    );

 
    await client.query(
      `UPDATE users 
       SET phone = COALESCE($1, phone),
           address = COALESCE($2, address)
       WHERE user_id = $3 AND role = 'Pharmacist'`,
      [phone, address, pharmacistId]
    );

    await client.query('COMMIT');
    
    res.json({ message: "Pharmacist profile updated successfully" });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error updating pharmacist:", err);
    res.status(500).json({ error: "Failed to update pharmacist profile" });
  } finally {
    client.release();
  }
};

const getPharmacistStats = async (req, res) => {
  const { pharmacistId } = req.params;
  
  try {
    const pendingRequests = await pool.query(
      `SELECT COUNT(*) FROM stock_requests 
       WHERE pharmacist_id = $1 AND status = 'Pending'`,
      [pharmacistId]
    );
    
    const completedRequests = await pool.query(
      `SELECT COUNT(*) FROM stock_requests 
       WHERE pharmacist_id = $1 AND status = 'Completed'`,
      [pharmacistId]
    );
    
    const lowStockMedicines = await pool.query(
      `SELECT COUNT(*) FROM medicines WHERE stock < 10`
    );
    
    res.json({
      pending_requests: parseInt(pendingRequests.rows[0].count),
      completed_requests: parseInt(completedRequests.rows[0].count),
      low_stock_medicines: parseInt(lowStockMedicines.rows[0].count)
    });
  } catch (err) {
    console.error("Error fetching pharmacist stats:", err);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
};

module.exports = {
  getAllPharmacists,
  getPharmacistById,
  updatePharmacistProfile,
  getPharmacistStats
};