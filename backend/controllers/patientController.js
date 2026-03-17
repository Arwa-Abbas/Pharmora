
const { pool } = require('../config/database');

const getAllPatients = async (req, res) => {
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
        p.primary_doctor_id,
        CONCAT(doc.first_name, ' ', doc.last_name) as primary_doctor_name
      FROM users u
      JOIN patients p ON u.user_id = p.user_id
      LEFT JOIN users doc ON p.primary_doctor_id = doc.user_id
      WHERE u.role = 'Patient'
      ORDER BY u.first_name, u.last_name
    `);
    
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching patients:", err);
    res.status(500).json({ error: "Failed to fetch patients" });
  }
};

const getPatientById = async (req, res) => {
  const { patientId } = req.params;
  
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
        p.primary_doctor_id,
        CONCAT(doc.first_name, ' ', doc.last_name) as primary_doctor_name,
        doc.specialty as primary_doctor_specialty
      FROM users u
      JOIN patients p ON u.user_id = p.user_id
      LEFT JOIN users doc ON p.primary_doctor_id = doc.user_id
      LEFT JOIN doctors d ON doc.user_id = d.user_id
      WHERE u.user_id = $1 AND u.role = 'Patient'
    `, [patientId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Patient not found" });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching patient:", err);
    res.status(500).json({ error: "Failed to fetch patient" });
  }
};

const updatePatientProfile = async (req, res) => {
  const { patientId } = req.params;
  const { 
    first_name, last_name, phone, address, city, country,
    primary_doctor_id 
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
       WHERE user_id = $7 AND role = 'Patient'`,
      [first_name, last_name, phone, address, city, country, patientId]
    );

    await client.query(
      `UPDATE patients 
       SET primary_doctor_id = COALESCE($1, primary_doctor_id)
       WHERE user_id = $2`,
      [primary_doctor_id, patientId]
    );

    await client.query('COMMIT');
    
    res.json({ message: "Patient profile updated successfully" });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error updating patient:", err);
    res.status(500).json({ error: "Failed to update patient profile" });
  } finally {
    client.release();
  }
};

const getPatientPrescriptions = async (req, res) => {
  const { patientId } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT 
        p.prescription_id,
        p.date_issued,
        p.status,
        p.diagnosis,
        p.notes,
        p.prescription_image,
        CONCAT(doc.first_name, ' ', doc.last_name) as doctor_name,
        COALESCE(
          json_agg(
            json_build_object(
              'medicine_name', m.name,
              'dosage', pm.dosage,
              'frequency', pm.frequency,
              'duration', pm.duration
            ) ORDER BY pm.prescribed_medicine_id
          ) FILTER (WHERE pm.prescribed_medicine_id IS NOT NULL),
          '[]'
        ) as medicines
      FROM prescriptions p
      LEFT JOIN users doc ON p.doctor_id = doc.user_id
      LEFT JOIN prescribed_medicines pm ON p.prescription_id = pm.prescription_id
      LEFT JOIN medicines m ON pm.medicine_id = m.medicine_id
      WHERE p.patient_id = $1
      GROUP BY p.prescription_id, doc.first_name, doc.last_name
      ORDER BY p.date_issued DESC
    `, [patientId]);
    
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching patient prescriptions:", err);
    res.status(500).json({ error: "Failed to fetch prescriptions" });
  }
};

const getPatientOrders = async (req, res) => {
  const { patientId } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT 
        o.order_id,
        o.order_date,
        o.total_price,
        o.status,
        o.delivery_address,
        p.prescription_id,
        json_agg(
          json_build_object(
            'medicine_name', m.name,
            'quantity', oi.quantity,
            'price', oi.price,
            'image_url', m.image_url
          )
        ) as items
      FROM orders o
      LEFT JOIN prescriptions p ON o.prescription_id = p.prescription_id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      LEFT JOIN medicines m ON oi.medicine_id = m.medicine_id
      WHERE o.user_id = $1
      GROUP BY o.order_id, p.prescription_id
      ORDER BY o.order_date DESC
    `, [patientId]);
    
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching patient orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

module.exports = {
  getAllPatients,
  getPatientById,
  updatePatientProfile,
  getPatientPrescriptions,
  getPatientOrders
};