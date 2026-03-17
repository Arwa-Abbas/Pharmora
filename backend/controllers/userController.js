
const { pool } = require('../config/database');

const getAllUsers = async (req, res) => {
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
        u.role,
        CASE 
          WHEN u.role = 'Patient' THEN json_build_object(
            'primary_doctor_id', p.primary_doctor_id
          )
          WHEN u.role = 'Doctor' THEN json_build_object(
            'specialty', d.specialty,
            'medical_license', d.medical_license
          )
          WHEN u.role = 'Pharmacist' THEN json_build_object(
            'pharmacy_name', ph.pharmacy_name,
            'pharmacy_license', ph.pharmacy_license
          )
          WHEN u.role = 'Supplier' THEN json_build_object(
            'company_name', s.company_name,
            'supplier_reg_id', s.supplier_reg_id
          )
          ELSE NULL
        END as role_data
      FROM users u
      LEFT JOIN patients p ON u.user_id = p.user_id AND u.role = 'Patient'
      LEFT JOIN doctors d ON u.user_id = d.user_id AND u.role = 'Doctor'
      LEFT JOIN pharmacists ph ON u.user_id = ph.user_id AND u.role = 'Pharmacist'
      LEFT JOIN suppliers s ON u.user_id = s.user_id AND u.role = 'Supplier'
      WHERE u.role NOT IN ('Admin')
      ORDER BY u.first_name, u.last_name
    `);
    
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching all users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

const getUserById = async (req, res) => {
  const { userId } = req.params;
  
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
        u.role,
        CASE 
          WHEN u.role = 'Patient' THEN (
            SELECT json_build_object(
              'primary_doctor_id', p.primary_doctor_id,
              'primary_doctor_name', CONCAT(doc.first_name, ' ', doc.last_name)
            )
            FROM patients p
            LEFT JOIN users doc ON p.primary_doctor_id = doc.user_id
            WHERE p.user_id = u.user_id
          )
          WHEN u.role = 'Doctor' THEN (
            SELECT json_build_object(
              'specialty', d.specialty,
              'medical_license', d.medical_license
            )
            FROM doctors d
            WHERE d.user_id = u.user_id
          )
          WHEN u.role = 'Pharmacist' THEN (
            SELECT json_build_object(
              'pharmacy_name', ph.pharmacy_name,
              'pharmacy_license', ph.pharmacy_license
            )
            FROM pharmacists ph
            WHERE ph.user_id = u.user_id
          )
          WHEN u.role = 'Supplier' THEN (
            SELECT json_build_object(
              'company_name', s.company_name,
              'supplier_reg_id', s.supplier_reg_id
            )
            FROM suppliers s
            WHERE s.user_id = u.user_id
          )
          ELSE NULL
        END as role_data
      FROM users u
      WHERE u.user_id = $1
    `, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

module.exports = {
  getAllUsers,
  getUserById
};