
const { pool } = require('../config/database');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'pharmora_secret_key';

const signup = async (req, res) => {
  const { role, formData } = req.body;

  if (!role || !formData) return res.status(400).json({ error: "Missing data" });

  if (formData.password.length < 8)
    return res.status(400).json({ error: "Password must be at least 8 characters" });

  if (formData.password !== formData.confirmPassword)
    return res.status(400).json({ error: "Passwords do not match" });

  const allowedRoles = ['Patient', 'Doctor', 'Pharmacist', 'Supplier'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const hashedPassword = await bcrypt.hash(formData.password, 12);

    const userInsert = await client.query(
      `INSERT INTO users
       (first_name, last_name, email, phone, address, city, country, password_hash, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING user_id`,
      [
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.phone,
        formData.address,
        formData.city,
        formData.country,
        hashedPassword,
        role
      ]
    );

    const userId = userInsert.rows[0].user_id;

    switch (role) {
      case "Patient":
        await client.query(
          `INSERT INTO patients (user_id, primary_doctor_id) VALUES ($1, $2)`,
          [userId, formData.primaryDoctorId || null]
        );
        break;
      case "Doctor":
        await client.query(
          `INSERT INTO doctors (user_id, specialty, medical_license) VALUES ($1, $2, $3)`,
          [userId, formData.specialty, formData.medicalLicense]
        );
        break;
      case "Pharmacist":
        await client.query(
          `INSERT INTO pharmacists (user_id, pharmacy_name, pharmacy_license) VALUES ($1, $2, $3)`,
          [userId, formData.pharmacyName, formData.pharmacyLicense]
        );
        break;
      case "Supplier":
        await client.query(
          `INSERT INTO suppliers (user_id, company_name, supplier_reg_id) VALUES ($1, $2, $3)`,
          [userId, formData.companyName, formData.supplierId]
        );
        break;
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: "Signup successful",
      user: {
        id: userId,
        role,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email
      }
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Signup error:", err);
    if (err.code === '23505') {
      res.status(400).json({ error: "Email already exists" });
    } else {
      res.status(500).json({ error: "Failed to create account" });
    }
  } finally {
    client.release();
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "No account found with this email" });
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    let roleData = null;
    if (user.role === 'Patient') {
      const r = await pool.query("SELECT * FROM patients WHERE user_id = $1", [user.user_id]);
      roleData = r.rows[0];
    } else if (user.role === 'Doctor') {
      const r = await pool.query("SELECT * FROM doctors WHERE user_id = $1", [user.user_id]);
      roleData = r.rows[0];
    } else if (user.role === 'Pharmacist') {
      const r = await pool.query("SELECT * FROM pharmacists WHERE user_id = $1", [user.user_id]);
      roleData = r.rows[0];
    } else if (user.role === 'Supplier') {
      const r = await pool.query("SELECT * FROM suppliers WHERE user_id = $1", [user.user_id]);
      roleData = r.rows[0];
    }

    const token = jwt.sign(
      { id: user.user_id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.user_id,
        firstName: user.first_name,
        lastName: user.last_name,
        fullName: `${user.first_name} ${user.last_name}`,
        email: user.email,
        role: user.role,
        roleData: roleData
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
};

module.exports = { signup, login };
