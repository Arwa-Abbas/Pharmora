// controllers/prescriptionController.js
const { pool } = require('../config/database');

const uploadPrescription = async (req, res) => {
  const { patient_id, doctor_id, prescription_image, notes, order_id } = req.body;
  
  if (!order_id) {
    return res.status(400).json({ error: "Order ID is required" });
  }
  
  try {
    const orderCheck = await pool.query(
      "SELECT * FROM orders WHERE order_id = $1 AND user_id = $2",
      [order_id, patient_id]
    );
    
    if (orderCheck.rows.length === 0) {
      return res.status(400).json({ error: "Order not found or does not belong to patient" });
    }

    const result = await pool.query(
      `INSERT INTO prescriptions (patient_id, doctor_id, date_issued, status, prescription_image, notes, order_id)
       VALUES ($1, $2, CURRENT_DATE, 'Pending', $3, $4, $5) RETURNING *`,
      [patient_id, doctor_id || null, prescription_image, notes || '', order_id]
    );

    await pool.query(
      "UPDATE orders SET prescription_id = $1 WHERE order_id = $2",
      [result.rows[0].prescription_id, order_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error uploading prescription:", err);
    res.status(500).json({ error: "Failed to upload prescription" });
  }
};

const getUserPrescriptions = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT p.*, u.name as doctor_name 
       FROM prescriptions p
       LEFT JOIN users u ON p.doctor_id = u.user_id
       WHERE p.patient_id = $1
       ORDER BY p.date_issued DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching prescriptions:", err);
    res.status(500).json({ error: "Failed to fetch prescriptions" });
  }
};

const updatePrescription = async (req, res) => {
  const { prescriptionId } = req.params;
  const { doctor_id, prescription_image, notes, order_id } = req.body;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const currentPrescription = await client.query(
      "SELECT order_id FROM prescriptions WHERE prescription_id = $1",
      [prescriptionId]
    );
    
    if (currentPrescription.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "Prescription not found" });
    }

    const oldOrderId = currentPrescription.rows[0].order_id;

    const result = await client.query(
      `UPDATE prescriptions 
       SET doctor_id = $1, prescription_image = $2, notes = $3, order_id = $4
       WHERE prescription_id = $5 
       RETURNING *`,
      [doctor_id, prescription_image, notes, order_id, prescriptionId]
    );

    if (oldOrderId) {
      await client.query(
        "UPDATE orders SET prescription_id = NULL WHERE order_id = $1 AND prescription_id = $2",
        [oldOrderId, prescriptionId]
      );
    }

    await client.query(
      "UPDATE orders SET prescription_id = $1 WHERE order_id = $2",
      [prescriptionId, order_id]
    );

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error updating prescription:", err);
    res.status(500).json({ error: "Failed to update prescription" });
  } finally {
    client.release();
  }
};

const deletePrescription = async (req, res) => {
  const { prescriptionId } = req.params;
  
  try {
    const result = await pool.query(
      "DELETE FROM prescriptions WHERE prescription_id = $1 RETURNING *",
      [prescriptionId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Prescription not found" });
    }
    
    res.json({ message: "Prescription deleted successfully" });
  } catch (err) {
    console.error("Error deleting prescription:", err);
    res.status(500).json({ error: "Failed to delete prescription" });
  }
};

const getPatientPrescriptions = async (req, res) => {
  const { patientId } = req.params;
  try {
    const result = await pool.query(
      `SELECT p.*, 
              u.name as doctor_name,
              json_agg(
                json_build_object(
                  'medicine_name', m.name,
                  'dosage', pm.dosage,
                  'frequency', pm.frequency,
                  'duration', pm.duration
                )
              ) FILTER (WHERE pm.prescribed_medicine_id IS NOT NULL) as medicines
       FROM prescriptions p
       LEFT JOIN users u ON p.doctor_id = u.user_id
       LEFT JOIN prescribed_medicines pm ON p.prescription_id = pm.prescription_id
       LEFT JOIN medicines m ON pm.medicine_id = m.medicine_id
       WHERE p.patient_id = $1
       GROUP BY p.prescription_id, u.name
       ORDER BY p.date_issued DESC`,
      [patientId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching patient prescriptions:", err);
    res.status(500).json({ error: "Failed to fetch patient prescriptions" });
  }
};

const verifyPrescription = async (req, res) => {
  const { prescriptionId } = req.params;
  const { doctor_id, status, notes } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE prescriptions 
       SET doctor_id = $1, status = $2, notes = COALESCE($3, notes)
       WHERE prescription_id = $4 
       RETURNING *`,
      [doctor_id, status, notes, prescriptionId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error verifying prescription:", err);
    res.status(500).json({ error: "Failed to verify prescription" });
  }
};

const createDoctorPrescription = async (req, res) => {
  const { doctor_id, patient_id, medicines, diagnosis, notes, prescription_image } = req.body;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const presResult = await client.query(
      `INSERT INTO prescriptions (patient_id, doctor_id, date_issued, status, prescription_image, notes, diagnosis)
       VALUES ($1, $2, CURRENT_DATE, 'Verified', $3, $4, $5) RETURNING *`,
      [patient_id, doctor_id, prescription_image || null, notes || '', diagnosis || '']
    );

    const prescriptionId = presResult.rows[0].prescription_id;

    if (medicines && medicines.length > 0) {
      for (const med of medicines) {
        await client.query(
          `INSERT INTO prescribed_medicines (prescription_id, medicine_id, dosage, frequency, duration)
           VALUES ($1, $2, $3, $4, $5)`,
          [prescriptionId, med.medicine_id, med.dosage, med.frequency, med.duration]
        );
      }
    }

    await client.query('COMMIT');
    res.status(201).json(presResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error creating prescription:", err);
    res.status(500).json({ error: "Failed to create prescription" });
  } finally {
    client.release();
  }
};

module.exports = {
  uploadPrescription,
  getUserPrescriptions,
  updatePrescription,
  deletePrescription,
  getPatientPrescriptions,
  verifyPrescription,
  createDoctorPrescription
};