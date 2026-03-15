// controllers/adminController.js
const { pool } = require('../config/database');
const bcrypt = require("bcryptjs");

const testSimple = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        user_id,
        CONCAT(first_name, ' ', last_name) as name,
        email
      FROM users
      LIMIT 5
    `);
    res.json({
      success: true,
      users: result.rows,
      message: `Found ${result.rows.length} users`
    });
  } catch (err) {
    console.error("Simple test failed:", err.message);
    res.status(500).json({
      success: false,
      error: err.message,
      hint: "Check if users table exists and is accessible"
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        user_id,
        first_name,
        last_name,
        CONCAT(first_name, ' ', last_name) as name,
        email,
        COALESCE(phone, '') as phone,
        COALESCE(address, '') as address,
        role
      FROM users
      WHERE role NOT IN ('Admin', 'admin')
      ORDER BY user_id DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({
      error: "Failed to fetch users",
      details: err.message
    });
  }
};

const getAdminStats = async (req, res) => {
  try {
    const usersCount = await pool.query(`
      SELECT COUNT(DISTINCT user_id) FROM users
      WHERE role NOT IN ('Admin', 'admin')
    `);

    const medicinesCount = await pool.query("SELECT COUNT(*) FROM medicines");
    const ordersCount = await pool.query("SELECT COUNT(*) FROM orders");
    const prescriptionsCount = await pool.query("SELECT COUNT(*) FROM prescriptions");

    const usersByRole = await pool.query(`
      SELECT
        role,
        COUNT(DISTINCT user_id) as count
      FROM users
      WHERE role NOT IN ('Admin', 'admin')
      GROUP BY role
      ORDER BY role
    `);

    const roleCounts = {};
    usersByRole.rows.forEach(row => {
      roleCounts[row.role] = parseInt(row.count);
    });

    const recentOrders = await pool.query(`
      SELECT o.order_id,
             CONCAT(u.first_name, ' ', u.last_name) as name,
             o.total_price,
             o.status,
             o.order_date
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      ORDER BY o.order_date DESC
      LIMIT 5
    `);

    const lowStock = await pool.query(`
      SELECT name, stock
      FROM medicines
      WHERE stock < 10
      ORDER BY stock ASC
      LIMIT 5
    `);

    const revenueResult = await pool.query(`
      SELECT COALESCE(SUM(total_price), 0) as total_revenue
      FROM orders
    `);

    res.json({
      total_users: parseInt(usersCount.rows[0].count),
      total_medicines: parseInt(medicinesCount.rows[0].count),
      total_orders: parseInt(ordersCount.rows[0].count),
      total_prescriptions: parseInt(prescriptionsCount.rows[0].count || 0),
      total_revenue: parseFloat(revenueResult.rows[0].total_revenue || 0),
      users_by_role: roleCounts,
      recent_orders: recentOrders.rows,
      low_stock_medicines: lowStock.rows
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ error: "Failed to fetch dashboard statistics" });
  }
};

const getReports = async (req, res) => {
  try {
    const { type, format = 'json' } = req.query;

    let reportData;
    let filename = '';

    switch (type) {
      case 'sales':
        reportData = await pool.query(`
          SELECT
            DATE(o.order_date) as date,
            COUNT(*) as order_count,
            SUM(o.total_price) as total_revenue,
            AVG(o.total_price) as avg_order_value
          FROM orders o
          WHERE o.order_date >= CURRENT_DATE - INTERVAL '30 days'
          GROUP BY DATE(o.order_date)
          ORDER BY date DESC
        `);
        filename = 'sales_report';
        break;

      case 'users':
        reportData = await pool.query(`
          SELECT
            role,
            COUNT(*) as user_count,
            ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users WHERE role NOT IN ('Admin', 'admin')), 2) as percentage
          FROM users
          WHERE role NOT IN ('Admin', 'admin')
          GROUP BY role
          ORDER BY user_count DESC
        `);
        filename = 'user_distribution_report';
        break;

      case 'medicines':
        reportData = await pool.query(`
          SELECT
            m.name,
            m.category,
            m.price,
            m.stock,
            COALESCE(SUM(oi.quantity), 0) as total_sold,
            COALESCE(SUM(oi.quantity * oi.price), 0) as total_revenue
          FROM medicines m
          LEFT JOIN order_items oi ON m.medicine_id = oi.medicine_id
          LEFT JOIN orders o ON oi.order_id = o.order_id
          WHERE o.order_date >= CURRENT_DATE - INTERVAL '30 days' OR o.order_id IS NULL
          GROUP BY m.medicine_id, m.name, m.category, m.price, m.stock
          ORDER BY total_sold DESC
          LIMIT 50
        `);
        filename = 'medicine_analytics_report';
        break;

      default:
        return res.status(400).json({ error: "Invalid report type" });
    }

    const data = reportData.rows;
    const timestamp = new Date().toISOString().split('T')[0];

    if (format === 'csv') {
      let csv = '';

      if (data.length > 0) {
        const headers = Object.keys(data[0]);
        csv += headers.join(',') + '\n';

        data.forEach(row => {
          const values = headers.map(header => {
            let value = row[header];
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              value = `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          });
          csv += values.join(',') + '\n';
        });
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}_${timestamp}.csv`);
      return res.send(csv);
    }

    res.json(data);
  } catch (err) {
    console.error("Error generating report:", err);
    res.status(500).json({ error: "Failed to generate report: " + err.message });
  }
};

const deleteUser = async (req, res) => {
  const { userId } = req.params;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const userResult = await client.query("SELECT role FROM users WHERE user_id = $1", [userId]);
    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "User not found" });
    }

    const userRole = userResult.rows[0].role;

    switch (userRole.toLowerCase()) {
      case 'patient':
        await client.query("DELETE FROM patients WHERE user_id = $1", [userId]);
        break;
      case 'doctor':
        await client.query("DELETE FROM doctors WHERE user_id = $1", [userId]);
        break;
      case 'pharmacist':
        await client.query("DELETE FROM pharmacists WHERE user_id = $1", [userId]);
        break;
      case 'supplier':
        await client.query("DELETE FROM suppliers WHERE user_id = $1", [userId]);
        break;
    }

    await client.query("DELETE FROM cart_items WHERE user_id = $1", [userId]);
    await client.query("DELETE FROM orders WHERE user_id = $1", [userId]);
    await client.query("UPDATE prescriptions SET patient_id = NULL WHERE patient_id = $1", [userId]);
    await client.query("UPDATE prescriptions SET doctor_id = NULL WHERE doctor_id = $1", [userId]);
    await client.query("DELETE FROM users WHERE user_id = $1", [userId]);

    await client.query('COMMIT');
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Failed to delete user: " + err.message });
  } finally {
    client.release();
  }
};

const updateUser = async (req, res) => {
  const { userId } = req.params;
  const { name, email, phone, address, role } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const currentUser = await client.query(
      "SELECT role FROM users WHERE user_id = $1",
      [userId]
    );

    if (currentUser.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "User not found" });
    }

    const currentRole = currentUser.rows[0].role;

    const nameParts = name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const userResult = await client.query(
      `UPDATE users
       SET first_name = $1, last_name = $2, email = $3, phone = $4, address = $5, role = $6
       WHERE user_id = $7
       RETURNING *`,
      [firstName, lastName, email, phone, address, role, userId]
    );

    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "User not found" });
    }

    if (currentRole.toLowerCase() !== role.toLowerCase()) {
      switch (currentRole.toLowerCase()) {
        case 'patient':
          await client.query("DELETE FROM patients WHERE user_id = $1", [userId]);
          break;
        case 'doctor':
          await client.query("DELETE FROM doctors WHERE user_id = $1", [userId]);
          break;
        case 'pharmacist':
          await client.query("DELETE FROM pharmacists WHERE user_id = $1", [userId]);
          break;
        case 'supplier':
          await client.query("DELETE FROM suppliers WHERE user_id = $1", [userId]);
          break;
      }

      switch (role.toLowerCase()) {
        case 'patient':
          await client.query("INSERT INTO patients (user_id) VALUES ($1)", [userId]);
          break;
        case 'doctor':
          await client.query(
            "INSERT INTO doctors (user_id, specialty, medical_license) VALUES ($1, $2, $3)",
            [userId, 'General Practitioner', 'LIC-' + Date.now()]
          );
          break;
        case 'pharmacist':
          await client.query(
            "INSERT INTO pharmacists (user_id, pharmacy_name, pharmacy_license) VALUES ($1, $2, $3)",
            [userId, name + ' Pharmacy', 'PHARM-' + Date.now()]
          );
          break;
        case 'supplier':
          await client.query(
            "INSERT INTO suppliers (user_id, company_name, supplier_reg_id) VALUES ($1, $2, $3)",
            [userId, name + ' Company', 'SUPP-' + Date.now()]
          );
          break;
      }
    } else {
      switch (role.toLowerCase()) {
        case 'patient':
          const patientCheck = await client.query("SELECT * FROM patients WHERE user_id = $1", [userId]);
          if (patientCheck.rows.length === 0) {
            await client.query("INSERT INTO patients (user_id) VALUES ($1)", [userId]);
          }
          break;
        case 'doctor':
          const doctorCheck = await client.query("SELECT * FROM doctors WHERE user_id = $1", [userId]);
          if (doctorCheck.rows.length === 0) {
            await client.query(
              "INSERT INTO doctors (user_id, specialty, medical_license) VALUES ($1, $2, $3)",
              [userId, 'General Practitioner', 'LIC-' + Date.now()]
            );
          }
          break;
        case 'pharmacist':
          const pharmacistCheck = await client.query("SELECT * FROM pharmacists WHERE user_id = $1", [userId]);
          if (pharmacistCheck.rows.length === 0) {
            await client.query(
              "INSERT INTO pharmacists (user_id, pharmacy_name, pharmacy_license) VALUES ($1, $2, $3)",
              [userId, name + ' Pharmacy', 'PHARM-' + Date.now()]
            );
          }
          break;
        case 'supplier':
          const supplierCheck = await client.query("SELECT * FROM suppliers WHERE user_id = $1", [userId]);
          if (supplierCheck.rows.length === 0) {
            await client.query(
              "INSERT INTO suppliers (user_id, company_name, supplier_reg_id) VALUES ($1, $2, $3)",
              [userId, name + ' Company', 'SUPP-' + Date.now()]
            );
          }
          break;
      }
    }

    await client.query('COMMIT');

    res.json({
      message: "User updated successfully",
      user: {
        ...userResult.rows[0],
        name: `${userResult.rows[0].first_name} ${userResult.rows[0].last_name}`
      }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Failed to update user: " + err.message });
  } finally {
    client.release();
  }
};

const createUser = async (req, res) => {
  const { name, email, phone, address, role, password } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const emailCheck = await client.query("SELECT * FROM users WHERE email = $1", [email]);
    if (emailCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const nameParts = name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const userResult = await client.query(
      `INSERT INTO users (first_name, last_name, email, phone, address, password_hash, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING user_id`,
      [firstName, lastName, email, phone, address, passwordHash, role]
    );

    const userId = userResult.rows[0].user_id;

    switch (role.toLowerCase()) {
      case 'patient':
        await client.query("INSERT INTO patients (user_id) VALUES ($1)", [userId]);
        break;
      case 'doctor':
        await client.query(
          "INSERT INTO doctors (user_id, specialty, medical_license) VALUES ($1, $2, $3)",
          [userId, 'General Practitioner', 'LIC-' + Date.now()]
        );
        break;
      case 'pharmacist':
        await client.query(
          "INSERT INTO pharmacists (user_id, pharmacy_name, pharmacy_license) VALUES ($1, $2, $3)",
          [userId, name + ' Pharmacy', 'PHARM-' + Date.now()]
        );
        break;
      case 'supplier':
        await client.query(
          "INSERT INTO suppliers (user_id, company_name, supplier_reg_id) VALUES ($1, $2, $3)",
          [userId, name + ' Company', 'SUPP-' + Date.now()]
        );
        break;
    }

    await client.query('COMMIT');
    res.status(201).json({ message: "User created successfully", user_id: userId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error creating user:", err);

    if (err.code === '23505') {
      res.status(400).json({ error: "Email already exists" });
    } else {
      res.status(500).json({ error: "Failed to create user" });
    }
  } finally {
    client.release();
  }
};

const getAllPatients = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        u.user_id,
        u.first_name,
        u.last_name,
        CONCAT(u.first_name, ' ', u.last_name) as name,
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

const getAllDoctors = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        u.user_id,
        u.first_name,
        u.last_name,
        CONCAT(u.first_name, ' ', u.last_name) as name,
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

const getAllPharmacists = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        u.user_id,
        u.first_name,
        u.last_name,
        CONCAT(u.first_name, ' ', u.last_name) as name,
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

const getAllSuppliers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        u.user_id,
        u.first_name,
        u.last_name,
        CONCAT(u.first_name, ' ', u.last_name) as name,
        u.email,
        u.phone,
        u.address,
        u.city,
        u.country,
        s.company_name,
        s.supplier_reg_id
      FROM users u
      JOIN suppliers s ON u.user_id = s.user_id
      WHERE u.role = 'Supplier'
      ORDER BY s.company_name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching suppliers:", err);
    res.status(500).json({ error: "Failed to fetch suppliers" });
  }
};

module.exports = {
  testSimple,
  getAllUsers,
  getAdminStats,
  getReports,
  deleteUser,
  updateUser,
  createUser,
  getAllPatients,
  getAllDoctors,
  getAllPharmacists,
  getAllSuppliers
};
