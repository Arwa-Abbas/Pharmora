// controllers/doctorController.js
const { pool } = require('../config/database');

const getAllDoctors = async (req, res) => {
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
        d.specialty,
        d.medical_license
      FROM users u
      JOIN doctors d ON u.user_id = d.user_id
      WHERE u.role = 'Doctor'
      ORDER BY u.first_name, u.last_name
    `);
    
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching doctors:", err);
    res.status(500).json({ error: "Failed to fetch doctors" });
  }
};

const getDoctorById = async (req, res) => {
  const { doctorId } = req.params;
  
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
        d.specialty,
        d.medical_license
      FROM users u
      JOIN doctors d ON u.user_id = d.user_id
      WHERE u.user_id = $1 AND u.role = 'Doctor'
    `, [doctorId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Doctor not found" });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching doctor:", err);
    res.status(500).json({ error: "Failed to fetch doctor" });
  }
};

const updateDoctorProfile = async (req, res) => {
  const { doctorId } = req.params;
  const { 
    first_name, last_name, phone, address, city, country,
    specialty, medical_license 
  } = req.body;
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    await client.query(
      `UPDATE users 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           phone = COALESCE($3, phone),
           address = COALESCE($4, address),
           city = COALESCE($5, city),
           country = COALESCE($6, country)
       WHERE user_id = $7 AND role = 'Doctor'`,
      [first_name, last_name, phone, address, city, country, doctorId]
    );

    await client.query(
      `UPDATE doctors 
       SET specialty = COALESCE($1, specialty),
           medical_license = COALESCE($2, medical_license)
       WHERE user_id = $3`,
      [specialty, medical_license, doctorId]
    );

    await client.query('COMMIT');
    
    res.json({ message: "Doctor profile updated successfully" });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error updating doctor:", err);
    res.status(500).json({ error: "Failed to update doctor profile" });
  } finally {
    client.release();
  }
};

const getDoctorPatients = async (req, res) => {
  const { doctorId } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT DISTINCT
        p.user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.address,
        u.city,
        u.country,
        CASE 
          WHEN p.primary_doctor_id = $1 THEN 'Primary'
          ELSE 'Past Patient'
        END as relationship
      FROM patients p
      JOIN users u ON p.user_id = u.user_id
      LEFT JOIN prescriptions pr ON p.user_id = pr.patient_id
      WHERE p.primary_doctor_id = $1 
         OR pr.doctor_id = $1
      ORDER BY u.first_name, u.last_name
    `, [doctorId]);
    
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching doctor's patients:", err);
    res.status(500).json({ error: "Failed to fetch patients" });
  }
};

const assignPatient = async (req, res) => {
  const { doctorId, patientId } = req.params;
  
  try {
    await pool.query(
      `UPDATE patients 
       SET primary_doctor_id = $1 
       WHERE user_id = $2`,
      [doctorId, patientId]
    );
    
    res.json({ message: "Patient assigned successfully" });
  } catch (err) {
    console.error("Error assigning patient:", err);
    res.status(500).json({ error: "Failed to assign patient" });
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  updateDoctorProfile,
  getDoctorPatients,
  assignPatient
};