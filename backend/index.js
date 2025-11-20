// Load environment variables
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const dns = require('dns');
const path = require('path');
const bcrypt = require("bcryptjs");

// Use IPv4 DNS resolution
dns.setDefaultResultOrder('ipv4first');

const app = express();

// ====================
// MIDDLEWARE SETUP
// ====================

// JSON and URL-encoded middleware with larger limits (10MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS middleware
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Serve static images
app.use("/images", express.static(path.join(__dirname, "public/images")));

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
});

// Test database connection
(async () => {
  try {
    await pool.query("SELECT 1");
    console.log("Connected to Supabase Postgres successfully");
  } catch (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }
})();

// Get all medicines
app.get("/medicines", async (req, res) => {
  try {
    const query = `
      SELECT medicine_id, supplier_id, name, category, description, price, stock, expiry_date, image_url
      FROM public.medicines
      ORDER BY medicine_id;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching medicines:", err.message);
    res.status(500).json({ error: "Failed to fetch medicines" });
  }
});

// Get all medicines (for prescription form) - only those in stock
app.get("/api/medicines", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT medicine_id, name, category, price
       FROM medicines
       WHERE stock > 0
       ORDER BY name`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching medicines for prescription form:", err);
    res.status(500).json({ error: "Failed to fetch medicines" });
  }
});

// Add a new medicine
app.post("/medicines", async (req, res) => {
  const { supplier_id, name, category, description, price, stock, expiry_date, image_url } = req.body;
  try {
    const insertQuery = `
      INSERT INTO public.medicines
        (supplier_id, name, category, description, price, stock, expiry_date, image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const { rows } = await pool.query(insertQuery, [
      supplier_id, name, category, description, price, stock, expiry_date, image_url
    ]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error inserting medicine:", err.message);
    res.status(500).json({ error: "Failed to insert medicine" });
  }
});

app.get("/suppliers", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM suppliers");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching suppliers:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all doctors - FIXED VERSION
app.get('/api/doctors', async (req, res) => {
  try {
    console.log("Fetching doctors...");
    
    const result = await pool.query(
      `SELECT 
          u.user_id,
          u.name,
          u.email,
          u.phone,
          u.address,
          d.specialty,
          d.medical_license
       FROM users u 
       JOIN doctors d ON u.user_id = d.user_id 
       WHERE LOWER(u.role) = 'doctor'
       ORDER BY u.name`
    );
    
    console.log(`Found ${result.rows.length} doctors`);
    
    if (result.rows.length === 0) {
      console.log("No doctors found in database");
      return res.json([]);
    }
    
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching doctors:", err);
    res.status(500).json({ error: 'Failed to fetch doctors: ' + err.message });
  }
});

// Get all pharmacists
// Get all pharmacists - FIXED VERSION
app.get("/api/pharmacists", async (req, res) => {
  try {
    console.log("Fetching pharmacists...");
    
    const result = await pool.query(
      `SELECT 
          p.user_id,
          p.first_name,
          p.last_name,
          p.email,
          p.phone,
          p.address,
          p.city,
          p.country,
          p.pharmacy_name,
          p.pharmacy_license,
          u.name as full_name
       FROM pharmacists p
       JOIN users u ON p.user_id = u.user_id
       ORDER BY p.first_name, p.last_name`
    );
    
    console.log(`Found ${result.rows.length} pharmacists`);
    
    if (result.rows.length === 0) {
      console.log("No pharmacists found in database");
      return res.json([]);
    }
    
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching pharmacists:", err);
    res.status(500).json({ error: 'Failed to fetch pharmacists: ' + err.message });
  }
});

//Create Account
app.post("/api/signup", async (req, res) => {
  const { role, formData } = req.body;

  if (!role || !formData) return res.status(400).json({ error: "Missing data" });

  if (formData.password.length < 8)
    return res.status(400).json({ error: "Password must be at least 8 characters" });

  if (formData.password !== formData.confirmPassword)
    return res.status(400).json({ error: "Passwords do not match" });

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(formData.password, 10);

    const userInsert = await pool.query(
      `INSERT INTO users (name, email, phone, address, password_hash, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING user_id`,
      [
        `${formData.firstName} ${formData.lastName}`,
        formData.email,
        formData.phone,
        formData.address,
        hashedPassword,
        role
      ]
    );

    const userId = userInsert.rows[0].user_id;

   
    let roleTable = "";
    let roleData = { user_id: userId };

    switch (role) {
      case "Patient":
        roleTable = "patients";
        Object.assign(roleData, {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          password: hashedPassword 
        });
        break;

      case "Doctor":
        roleTable = "doctors";
        Object.assign(roleData, {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          specialty: formData.specialty,
          medical_license: formData.medicalLicense,
          password: hashedPassword 
        });
        break;

      case "Pharmacist":
        roleTable = "pharmacists";
        Object.assign(roleData, {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          pharmacy_name: formData.pharmacyName,
          pharmacy_license: formData.pharmacyLicense,
          password: hashedPassword 
        });
        break;

      case "Supplier":
        roleTable = "suppliers";
        Object.assign(roleData, {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          company_name: formData.companyName,
          supplier_reg_id: formData.supplierId,
          password: hashedPassword 
        });
        break;

      default:
        return res.status(400).json({ error: "Invalid role" });
    }

 
    const roleInsert = await pool.query(
      `INSERT INTO ${roleTable} (${Object.keys(roleData).join(", ")})
       VALUES (${Object.keys(roleData).map((_, i) => "$" + (i + 1)).join(", ")})
       RETURNING *`,
      Object.values(roleData)
    );

    res.status(201).json({ message: "Signup successful", user: { id: userId, role, roleData: roleInsert.rows[0] } });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create account" });
  }
});

// User Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "No account found with this email" });
    }

    const user = result.rows[0];

    let validPassword = false;
    if (user.role.toLowerCase() === "admin") {
      validPassword = password === user.password_hash;
    } else {
      validPassword = await bcrypt.compare(password, user.password_hash);
    }

    if (!validPassword) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.user_id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

// ============= CART ROUTES =============
// Get user's cart
app.get("/api/cart/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT c.cart_item_id, c.quantity, m.medicine_id, m.name, m.price, 
              m.image_url, m.stock, m.category
       FROM cart_items c
       JOIN medicines m ON c.medicine_id = m.medicine_id
       WHERE c.user_id = $1`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

// Add item to cart
app.post("/api/cart", async (req, res) => {
  const { user_id, medicine_id, quantity } = req.body;
  try {
    // Check if item already exists in cart
    const existing = await pool.query(
      "SELECT * FROM cart_items WHERE user_id = $1 AND medicine_id = $2",
      [user_id, medicine_id]
    );

    if (existing.rows.length > 0) {
      // Update quantity
      const result = await pool.query(
        "UPDATE cart_items SET quantity = quantity + $1 WHERE user_id = $2 AND medicine_id = $3 RETURNING *",
        [quantity, user_id, medicine_id]
      );
      res.json(result.rows[0]);
    } else {
      // Insert new item
      const result = await pool.query(
        "INSERT INTO cart_items (user_id, medicine_id, quantity) VALUES ($1, $2, $3) RETURNING *",
        [user_id, medicine_id, quantity]
      );
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ error: "Failed to add to cart" });
  }
});

// Update cart item quantity
app.put("/api/cart/:cartItemId", async (req, res) => {
  const { cartItemId } = req.params;
  const { quantity } = req.body;
  try {
    const result = await pool.query(
      "UPDATE cart_items SET quantity = $1 WHERE cart_item_id = $2 RETURNING *",
      [quantity, cartItemId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating cart:", err);
    res.status(500).json({ error: "Failed to update cart" });
  }
});

// Remove item from cart
app.delete("/api/cart/:cartItemId", async (req, res) => {
  const { cartItemId } = req.params;
  try {
    await pool.query("DELETE FROM cart_items WHERE cart_item_id = $1", [cartItemId]);
    res.json({ message: "Item removed from cart" });
  } catch (err) {
    console.error("Error removing from cart:", err);
    res.status(500).json({ error: "Failed to remove from cart" });
  }
});

// ============= PRESCRIPTION ROUTES =============
// Upload prescription - UPDATED VERSION
app.post("/api/prescriptions", async (req, res) => {
  const { patient_id, doctor_id, prescription_image, notes, order_id } = req.body;
  
  // Validate required fields
  if (!order_id) {
    return res.status(400).json({ error: "Order ID is required" });
  }
  
  try {
    // Verify the order exists and belongs to the patient
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

    // Update the order to link it with the prescription
    await pool.query(
      "UPDATE orders SET prescription_id = $1 WHERE order_id = $2",
      [result.rows[0].prescription_id, order_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error uploading prescription:", err);
    res.status(500).json({ error: "Failed to upload prescription" });
  }
});

// Get user's prescriptions
app.get("/api/prescriptions/:userId", async (req, res) => {
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
});

// ============= ORDER ROUTES =============
// Create order
app.post("/api/orders", async (req, res) => {
  const { user_id, prescription_id, items, total_price, delivery_address } = req.body;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, prescription_id, order_date, total_price, status, delivery_address)
       VALUES ($1, $2, NOW(), $3, 'Pending', $4) RETURNING *`,
      [user_id, prescription_id || null, total_price, delivery_address]
    );

    const orderId = orderResult.rows[0].order_id;

    // Insert order items
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, medicine_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.medicine_id, item.quantity, item.price]
      );

      // Update medicine stock
      await client.query(
        `UPDATE medicines SET stock = stock - $1 WHERE medicine_id = $2`,
        [item.quantity, item.medicine_id]
      );
    }

    // Clear user's cart
    await client.query("DELETE FROM cart_items WHERE user_id = $1", [user_id]);

    await client.query('COMMIT');
    res.status(201).json(orderResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error creating order:", err);
    res.status(500).json({ error: "Failed to create order" });
  } finally {
    client.release();
  }
});

// Get user's orders
app.get("/api/orders/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT o.*, 
              json_agg(json_build_object(
                'medicine_name', m.name,
                'quantity', oi.quantity,
                'price', oi.price,
                'image_url', m.image_url
              )) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.order_id = oi.order_id
       LEFT JOIN medicines m ON oi.medicine_id = m.medicine_id
       WHERE o.user_id = $1
       GROUP BY o.order_id
       ORDER BY o.order_date DESC`,
      [userId]
    );
    
    // Make sure prescription_id is included in the response
    const ordersWithPrescription = result.rows.map(order => ({
      ...order,
      prescription_id: order.prescription_id || null
    }));
    
    res.json(ordersWithPrescription);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Get orders without prescriptions for a patient (including current order if editing)
app.get("/api/patient/:patientId/orders-without-prescriptions", async (req, res) => {
  const { patientId } = req.params;
  const { excludePrescriptionId } = req.query;
  
  try {
    let query = `
      SELECT o.* 
      FROM orders o
      WHERE o.user_id = $1 
      AND (o.prescription_id IS NULL OR o.prescription_id = 0)
    `;
    let params = [patientId];
    
    if (excludePrescriptionId) {
      query = `
        SELECT o.* 
        FROM orders o
        WHERE o.user_id = $1 
        AND (o.prescription_id IS NULL OR o.prescription_id = 0 OR o.prescription_id = $2)
      `;
      params = [patientId, excludePrescriptionId];
    }
    
    query += ` ORDER BY o.order_date DESC`;
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching orders without prescriptions:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Update prescription
app.put("/api/prescriptions/:prescriptionId", async (req, res) => {
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
});

// Delete prescription
app.delete("/api/prescriptions/:prescriptionId", async (req, res) => {
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
});

// ============= DOCTOR ROUTES =============
app.get("/api/doctor/pending-prescriptions/:doctorId", async (req, res) => {
  const { doctorId } = req.params;
  try {
    const doctorResult = await pool.query(
      `SELECT specialty FROM doctors WHERE user_id = $1`,
      [doctorId]
    );
    
    if (doctorResult.rows.length === 0) {
      return res.status(404).json({ error: "Doctor not found" });
    }
    
    const result = await pool.query(
      `SELECT p.*, u.name as patient_name, u.email as patient_email, u.phone as patient_phone,
              d.specialty as assigned_doctor_specialty
       FROM prescriptions p
       JOIN users u ON p.patient_id = u.user_id
       LEFT JOIN doctors d ON p.doctor_id = d.user_id
       WHERE p.status = 'Pending' 
       AND (p.doctor_id = $1 OR p.doctor_id IS NULL)
       ORDER BY p.date_issued DESC`,
      [doctorId]
    );
    
    const filteredPrescriptions = result.rows.filter(prescription => {
      if (prescription.doctor_id) {
        return prescription.doctor_id === parseInt(doctorId);
      }
      return true;
    });
    
    res.json(filteredPrescriptions);
  } catch (err) {
    console.error("Error fetching pending prescriptions:", err);
    res.status(500).json({ error: "Failed to fetch pending prescriptions" });
  }
});

// Get doctor's statistics
app.get("/api/doctor/:doctorId/stats", async (req, res) => {
  const { doctorId } = req.params;
  try {
    const prescriptionsCount = await pool.query(
      "SELECT COUNT(*) FROM prescriptions WHERE doctor_id = $1",
      [doctorId]
    );
    
    const patientsCount = await pool.query(
      "SELECT COUNT(DISTINCT patient_id) FROM prescriptions WHERE doctor_id = $1",
      [doctorId]
    );
    
    const pendingCount = await pool.query(
      "SELECT COUNT(*) FROM prescriptions WHERE status = 'Pending' AND doctor_id = $1",
      [doctorId]
    );

    const assignedPatientsCount = await pool.query(
      "SELECT COUNT(*) FROM patients WHERE primary_doctor_id = $1",
      [doctorId]
    );

    res.json({
      total_prescriptions: parseInt(prescriptionsCount.rows[0].count),
      total_patients: parseInt(patientsCount.rows[0].count),
      pending_prescriptions: parseInt(pendingCount.rows[0].count),
      assigned_patients: parseInt(assignedPatientsCount.rows[0].count)
    });
  } catch (err) {
    console.error("Error fetching doctor stats:", err);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

// Get prescriptions issued by doctor
app.get("/api/doctor/:doctorId/prescriptions", async (req, res) => {
  const { doctorId } = req.params;
  try {
    const result = await pool.query(
      `SELECT p.*, 
              u.name as patient_name,
              json_agg(
                json_build_object(
                  'medicine_name', m.name,
                  'dosage', pm.dosage,
                  'frequency', pm.frequency,
                  'duration', pm.duration
                )
              ) FILTER (WHERE pm.prescribed_medicine_id IS NOT NULL) as medicines
       FROM prescriptions p
       JOIN users u ON p.patient_id = u.user_id
       LEFT JOIN prescribed_medicines pm ON p.prescription_id = pm.prescription_id
       LEFT JOIN medicines m ON pm.medicine_id = m.medicine_id
       WHERE p.doctor_id = $1
       GROUP BY p.prescription_id, u.name
       ORDER BY p.date_issued DESC`,
      [doctorId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching doctor prescriptions:", err);
    res.status(500).json({ error: "Failed to fetch prescriptions" });
  }
});

// Get doctor's own patients
app.get("/api/doctor/:doctorId/patients", async (req, res) => {
  const { doctorId } = req.params;
  try {
    const result = await pool.query(
      `SELECT DISTINCT p.*, u.name, u.email, u.phone, u.address,
              CASE 
                WHEN p.primary_doctor_id = $1 THEN 'Primary Doctor'
                ELSE 'Previous Patient'
              END as relationship
       FROM patients p
       JOIN users u ON p.user_id = u.user_id
       WHERE p.primary_doctor_id = $1 
          OR p.user_id IN (
            SELECT DISTINCT patient_id FROM prescriptions WHERE doctor_id = $1
          )
       ORDER BY u.name`,
      [doctorId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching doctor's patients:", err);
    res.status(500).json({ error: "Failed to fetch patients" });
  }
});

// Get all patients for dropdown
app.get("/api/doctor/:doctorId/all-patients", async (req, res) => {
  const { doctorId } = req.params;
  try {
    const result = await pool.query(
      `SELECT p.*, u.name, u.email, u.phone, u.address,
              CASE 
                WHEN p.primary_doctor_id = $1 THEN 'Your Patient'
                WHEN EXISTS (SELECT 1 FROM prescriptions WHERE patient_id = p.user_id AND doctor_id = $1) THEN 'Previous Patient'
                ELSE 'New Patient'
              END as relationship
       FROM patients p
       JOIN users u ON p.user_id = u.user_id
       ORDER BY relationship, u.name`,
      [doctorId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching all patients:", err);
    res.status(500).json({ error: "Failed to fetch patients" });
  }
});

// Assign patient to doctor
app.put("/api/doctor/:doctorId/assign-patient/:patientId", async (req, res) => {
  const { doctorId, patientId } = req.params;
  try {
    const result = await pool.query(
      `UPDATE patients SET primary_doctor_id = $1 WHERE user_id = $2 RETURNING *`,
      [doctorId, patientId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error assigning patient:", err);
    res.status(500).json({ error: "Failed to assign patient" });
  }
});

// Get doctor's profile
app.get("/api/doctor/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT d.*, u.name, u.email, u.phone, u.address 
       FROM doctors d
       JOIN users u ON d.user_id = u.user_id
       WHERE d.user_id = $1`,
      [userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching doctor profile:", err);
    res.status(500).json({ error: "Failed to fetch doctor profile" });
  }
});

// Get doctor's specialty
app.get("/api/doctor/:doctorId/specialty", async (req, res) => {
  const { doctorId } = req.params;
  try {
    const result = await pool.query(
      `SELECT specialty FROM doctors WHERE user_id = $1`,
      [doctorId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching doctor specialty:", err);
    res.status(500).json({ error: "Failed to fetch doctor specialty" });
  }
});

// Get all patients
app.get("/api/patients", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, u.name, u.email, u.phone, u.address 
       FROM patients p
       JOIN users u ON p.user_id = u.user_id
       ORDER BY u.name`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching patients:", err);
    res.status(500).json({ error: "Failed to fetch patients" });
  }
});

// Get patient by ID
app.get("/api/patient/:patientId", async (req, res) => {
  const { patientId } = req.params;
  try {
    const result = await pool.query(
      `SELECT p.*, u.name, u.email, u.phone, u.address 
       FROM patients p
       JOIN users u ON p.user_id = u.user_id
       WHERE p.user_id = $1`,
      [patientId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching patient:", err);
    res.status(500).json({ error: "Failed to fetch patient" });
  }
});

// Create prescription by doctor
app.post("/api/doctor/prescriptions", async (req, res) => {
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
});

// Get patient's prescription history
app.get("/api/patient/:patientId/prescriptions", async (req, res) => {
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
});

// Verify prescription
app.put("/api/doctor/verify-prescription/:prescriptionId", async (req, res) => {
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
});

// =========================================================================
// PHARMACIST ROUTES - FIXED
// =========================================================================

// Get pharmacist details by user_id
app.get("/api/pharmacist/user/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM pharmacists WHERE user_id = $1`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Pharmacist not found" });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching pharmacist:", err);
    res.status(500).json({ error: "Failed to fetch pharmacist details" });
  }
});

// Get all medicines with supplier details
app.get("/api/pharmacist/medicines", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        m.medicine_id,
        m.supplier_id,
        m.name,
        m.category,
        m.description,
        m.price,
        m.stock,
        m.expiry_date,
        m.image_url,
        s.company_name as supplier_name,
        s.phone as supplier_phone,
        s.email as supplier_email
       FROM medicines m
       JOIN suppliers s ON m.supplier_id = s.supplier_id
       ORDER BY m.name, s.company_name`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching medicines for pharmacist:", err);
    res.status(500).json({ error: "Failed to fetch medicines" });
  }
});

// Get pharmacist's stock requests
app.get("/api/pharmacist/:pharmacistId/stock-requests", async (req, res) => {
  const { pharmacistId } = req.params;
  try {
    const result = await pool.query(
      `SELECT sr.*, 
              m.name as medicine_name, 
              m.category,
              s.company_name as supplier_name,
              s.phone as supplier_phone,
              s.email as supplier_email
       FROM stock_requests sr
       JOIN medicines m ON sr.medicine_id = m.medicine_id
       JOIN suppliers s ON sr.supplier_id = s.supplier_id
       WHERE sr.pharmacist_id = $1
       ORDER BY sr.request_date DESC`,
      [pharmacistId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching pharmacist stock requests:", err);
    res.status(500).json({ error: "Failed to fetch stock requests" });
  }
});

// Get pharmacist statistics
app.get("/api/pharmacist/:pharmacistId/stats", async (req, res) => {
  const { pharmacistId } = req.params;
  
  try {
    const medicinesResult = await pool.query(
      `SELECT COUNT(*) as count FROM medicines WHERE stock > 0`
    );
    
    const pendingResult = await pool.query(
      `SELECT COUNT(*) as count FROM stock_requests 
       WHERE pharmacist_id = $1 AND status = 'Pending'`,
      [pharmacistId]
    );
    
    const completedResult = await pool.query(
      `SELECT COUNT(*) as count FROM stock_requests 
       WHERE pharmacist_id = $1 AND status = 'Completed'`,
      [pharmacistId]
    );
    
    const lowStockResult = await pool.query(
      `SELECT COUNT(*) as count FROM medicines WHERE stock < 10`
    );
    
    res.json({
      total_medicines: parseInt(medicinesResult.rows[0].count) || 0,
      pending_requests: parseInt(pendingResult.rows[0].count),
      completed_deliveries: parseInt(completedResult.rows[0].count),
      low_stock_medicines: parseInt(lowStockResult.rows[0].count) || 0
    });
  } catch (err) {
    console.error("Error fetching pharmacist stats:", err);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

// Get pharmacist's delivered requests
app.get("/api/pharmacist/:pharmacistId/delivered-requests", async (req, res) => {
  const { pharmacistId } = req.params;
  try {
    const result = await pool.query(
      `SELECT sr.*, 
              m.name as medicine_name, 
              m.category,
              s.company_name as supplier_name,
              s.phone as supplier_phone
       FROM stock_requests sr
       JOIN medicines m ON sr.medicine_id = m.medicine_id
       JOIN suppliers s ON sr.supplier_id = s.supplier_id
       WHERE sr.pharmacist_id = $1 
       AND sr.status = 'Completed'
       ORDER BY sr.delivery_date DESC`,
      [pharmacistId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching delivered requests:", err);
    res.status(500).json({ error: "Failed to fetch delivered requests" });
  }
});

// Add medicine to pharmacist's inventory
app.post("/api/pharmacist/add-to-inventory", async (req, res) => {
  const { medicine_id, quantity, supplier_id, request_id } = req.body;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // First, verify the stock request exists and is completed
    const requestCheck = await client.query(
      `SELECT * FROM stock_requests 
       WHERE request_id = $1 AND status = 'Completed' AND delivery_status = 'Delivered'`,
      [request_id]
    );
    
    if (requestCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: "Completed delivery not found or already processed" });
    }

    const stockRequest = requestCheck.rows[0];

    // Get the selling price and expiry date from supplier_inventory
    const supplierInventoryCheck = await client.query(
      `SELECT selling_price, expiry_date FROM supplier_inventory 
       WHERE medicine_id = $1 AND supplier_id = $2`,
      [medicine_id, supplier_id]
    );
    
    if (supplierInventoryCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "Medicine not found in supplier inventory" });
    }

    const supplierItem = supplierInventoryCheck.rows[0];
    const sellingPrice = supplierItem.selling_price;
    const expiryDate = supplierItem.expiry_date;

    // Check if the medicine exists for this supplier in medicines table
    const medicineCheck = await client.query(
      `SELECT * FROM medicines WHERE medicine_id = $1 AND supplier_id = $2`,
      [medicine_id, supplier_id]
    );
    
    if (medicineCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "Medicine not found for this supplier" });
    }

    // Update the medicine stock, price, AND expiry date
    const result = await client.query(
      `UPDATE medicines 
       SET stock = stock + $1,
           price = $4,
           expiry_date = $5
       WHERE medicine_id = $2 AND supplier_id = $3
       RETURNING *`,
      [quantity, medicine_id, supplier_id, sellingPrice, expiryDate]
    );
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "Medicine not found" });
    }

    // Change status to 'Processed' to prevent duplicate processing
    await client.query(
      `UPDATE stock_requests 
       SET status = 'Processed',
           notes = COALESCE(notes, '') || ' | Added to pharmacy inventory on ' || CURRENT_TIMESTAMP
       WHERE request_id = $1`,
      [request_id]
    );

    await client.query('COMMIT');
    
    res.json({ 
      message: "Medicine successfully added to pharmacy inventory!",
      medicine: result.rows[0],
      added_quantity: quantity
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error adding to inventory:", err);
    res.status(500).json({ error: "Failed to add to inventory: " + err.message });
  } finally {
    client.release();
  }
});

// =========================================================================
// SUPPLIER ROUTES - FIXED
// =========================================================================

// Get all suppliers - FIXED VERSION
app.get("/api/suppliers", async (req, res) => {
  try {
    console.log("Fetching suppliers for dropdown...");
    
    const result = await pool.query(
      `SELECT 
          s.supplier_id,
          s.company_name,
          s.user_id,
          u.name as contact_name,
          u.email,
          u.phone,
          u.address
       FROM suppliers s
       JOIN users u ON s.user_id = u.user_id
       ORDER BY s.company_name`
    );
    
    console.log(`Found ${result.rows.length} suppliers`);
    
    if (result.rows.length === 0) {
      console.log("No suppliers found in database");
      return res.json([]);
    }
    
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching suppliers:", err);
    res.status(500).json({ error: 'Failed to fetch suppliers: ' + err.message });
  }
});

// Get supplier details by user_id
app.get("/api/supplier/user/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM suppliers WHERE user_id = $1`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching supplier:", err);
    res.status(500).json({ error: "Failed to fetch supplier details" });
  }
});

// Get supplier's inventory with medicine details
app.get("/api/supplier/:supplierId/inventory", async (req, res) => {
  const { supplierId } = req.params;
  try {
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
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});

// Get stock requests for a specific supplier
app.get("/api/supplier/:supplierId/stock-requests", async (req, res) => {
  const { supplierId } = req.params;
  try {
    const result = await pool.query(
      `SELECT sr.*, 
              m.name as medicine_name, 
              m.category,
              m.image_url,
              u.name as pharmacist_name, 
              u.email as pharmacist_email, 
              u.phone as pharmacist_phone,
              p.pharmacy_name
       FROM stock_requests sr
       JOIN medicines m ON sr.medicine_id = m.medicine_id
       JOIN users u ON sr.pharmacist_id = u.user_id
       JOIN pharmacists p ON sr.pharmacist_id = p.user_id
       WHERE sr.supplier_id = $1
       ORDER BY 
         CASE sr.status 
           WHEN 'Pending' THEN 1 
           WHEN 'Accepted' THEN 2 
           WHEN 'Completed' THEN 3 
           ELSE 4 
         END,
         sr.request_date DESC`,
      [supplierId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching stock requests:", err);
    res.status(500).json({ error: "Failed to fetch stock requests" });
  }
});

// Get available medicines (not yet in supplier's inventory)
app.get("/api/medicines/available", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT medicine_id, name, category, description, image_url
       FROM medicines
       ORDER BY name`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching available medicines:", err);
    res.status(500).json({ error: "Failed to fetch medicines" });
  }
});

// Add medicine to supplier inventory
app.post("/api/supplier/:supplierId/inventory", async (req, res) => {
  const { supplierId } = req.params;
  const { medicine_id, quantity_available, reorder_level, purchase_price, selling_price, expiry_date } = req.body;
  
  try {
    const existingResult = await pool.query(
      `SELECT * FROM supplier_inventory 
       WHERE supplier_id = $1 AND medicine_id = $2`,
      [supplierId, medicine_id]
    );

    if (existingResult.rows.length > 0) {
      return res.status(400).json({ error: "Medicine already exists in your inventory. Please update it instead." });
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
    console.error("Error adding medicine to inventory:", err);
    res.status(500).json({ error: "Failed to add medicine to inventory" });
  }
});

// Update supplier inventory item
app.put("/api/supplier/inventory/:inventoryId", async (req, res) => {
  const { inventoryId } = req.params;
  const { quantity_available, reorder_level, purchase_price, selling_price, expiry_date } = req.body;
  
  try {
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
    res.status(500).json({ error: "Failed to update inventory" });
  }
});

// Delete inventory item
app.delete("/api/supplier/inventory/:inventoryId", async (req, res) => {
  const { inventoryId } = req.params;
  
  try {
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
    res.status(500).json({ error: "Failed to delete inventory item" });
  }
});

// Update supplier details
app.put("/api/supplier/:supplierId", async (req, res) => {
  const { supplierId } = req.params;
  const { company_name, contact_number, address } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE suppliers 
       SET company_name = $1, phone = $2, address = $3
       WHERE supplier_id = $4
       RETURNING *`,
      [company_name, contact_number, address, supplierId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating supplier details:", err);
    res.status(500).json({ error: "Failed to update supplier details" });
  }
});

// Get supplier statistics/dashboard data
app.get("/api/supplier/:supplierId/stats", async (req, res) => {
  const { supplierId } = req.params;
  
  try {
    const pendingResult = await pool.query(
      `SELECT COUNT(*) as count FROM stock_requests 
       WHERE supplier_id = $1 AND status = 'Pending'`,
      [supplierId]
    );
    
    const inventoryResult = await pool.query(
      `SELECT 
         COUNT(*) as total_items,
         SUM(quantity_available * selling_price) as total_value,
         COUNT(CASE WHEN quantity_available <= reorder_level THEN 1 END) as low_stock_count
       FROM supplier_inventory 
       WHERE supplier_id = $1`,
      [supplierId]
    );
    
    const completedResult = await pool.query(
      `SELECT COUNT(*) as count FROM stock_requests 
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
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

// =========================================================================
// STOCK REQUEST FLOW ROUTES - FIXED
// =========================================================================

// Create stock request - FIXED (using default delivery_status)
// app.post("/api/stock-requests", async (req, res) => {
//   const { pharmacist_id, supplier_id, medicine_id, quantity_requested, notes, pharmacy_name } = req.body;
  
//   try {
//     const medicineCheck = await pool.query(
//       `SELECT name, stock FROM medicines WHERE medicine_id = $1`,
//       [medicine_id]
//     );
    
//     if (medicineCheck.rows.length === 0) {
//       return res.status(400).json({ error: "Medicine not found" });
//     }

//     const result = await pool.query(
//       `INSERT INTO stock_requests 
//        (pharmacist_id, supplier_id, medicine_id, quantity_requested, notes, pharmacy_name, 
//         request_date, status)
//        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE, 'Pending')
//        RETURNING *`,
//       [pharmacist_id, supplier_id, medicine_id, quantity_requested, notes || '', pharmacy_name]
//     );
    
//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     console.error("Error creating stock request:", err);
//     res.status(500).json({ error: "Failed to create stock request: " + err.message });
//   }
// });

// Accept a stock request - FIXED
// Accept a stock request - FIXED (with inventory check)
// app.put("/api/stock-requests/:requestId/accept", async (req, res) => {
//   const { requestId } = req.params;
  
//   const client = await pool.connect();
//   try {
//     await client.query('BEGIN');

//     // Get request details
//     const requestResult = await client.query(
//       `SELECT * FROM stock_requests WHERE request_id = $1`,
//       [requestId]
//     );
    
//     if (requestResult.rows.length === 0) {
//       await client.query('ROLLBACK');
//       return res.status(404).json({ error: "Request not found" });
//     }

//     const request = requestResult.rows[0];

//     // Check if supplier has enough inventory
//     const inventoryResult = await client.query(
//       `SELECT * FROM supplier_inventory 
//        WHERE supplier_id = $1 AND medicine_id = $2`,
//       [request.supplier_id, request.medicine_id]
//     );

//     if (inventoryResult.rows.length === 0) {
//       await client.query('ROLLBACK');
//       return res.status(400).json({ error: "Medicine not found in your inventory" });
//     }

//     const inventory = inventoryResult.rows[0];

//     if (inventory.quantity_available < request.quantity_requested) {
//       await client.query('ROLLBACK');
//       return res.status(400).json({ 
//         error: `Insufficient stock. Available: ${inventory.quantity_available}, Requested: ${request.quantity_requested}` 
//       });
//     }

//     // Update request status to Accepted
//     await client.query(
//       `UPDATE stock_requests SET status = 'Accepted' WHERE request_id = $1`,
//       [requestId]
//     );

//     await client.query('COMMIT');
//     res.json({ message: "Request accepted successfully" });
//   } catch (err) {
//     await client.query('ROLLBACK');
//     console.error("Error accepting request:", err);
//     res.status(500).json({ error: "Failed to accept request" });
//   } finally {
//     client.release();
//   }
// });

app.post("/api/stock-requests", async (req, res) => {
  const { pharmacist_id, supplier_id, medicine_id, quantity_requested, notes, pharmacy_name } = req.body;
  
  try {
    const medicineCheck = await pool.query(
      `SELECT name, stock FROM medicines WHERE medicine_id = $1`,
      [medicine_id]
    );
    
    if (medicineCheck.rows.length === 0) {
      return res.status(400).json({ error: "Medicine not found" });
    }

    const result = await pool.query(
      `INSERT INTO stock_requests 
       (pharmacist_id, supplier_id, medicine_id, quantity_requested, notes, pharmacy_name, 
        request_date, status, delivery_status)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE, 'Pending', 'NotShipped')
       RETURNING *`,
      [pharmacist_id, supplier_id, medicine_id, quantity_requested, notes || '', pharmacy_name]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating stock request:", err);
    res.status(500).json({ error: "Failed to create stock request: " + err.message });
  }
});

// Accept a stock request - COMPLETELY FIXED
app.put("/api/stock-requests/:requestId/accept", async (req, res) => {
  const { requestId } = req.params;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get request details
    const requestResult = await client.query(
      `SELECT * FROM stock_requests WHERE request_id = $1`,
      [requestId]
    );
    
    if (requestResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "Request not found" });
    }

    const request = requestResult.rows[0];

    // Check if supplier has enough inventory
    const inventoryResult = await client.query(
      `SELECT * FROM supplier_inventory 
       WHERE supplier_id = $1 AND medicine_id = $2`,
      [request.supplier_id, request.medicine_id]
    );

    if (inventoryResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: "Medicine not found in your inventory. Please add it first." });
    }

    const inventory = inventoryResult.rows[0];

    if (inventory.quantity_available < request.quantity_requested) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: `Insufficient stock. Available: ${inventory.quantity_available}, Requested: ${request.quantity_requested}` 
      });
    }

    // Update request status to Accepted
    const updateResult = await client.query(
      `UPDATE stock_requests 
       SET status = 'Accepted',
           updated_at = NOW()
       WHERE request_id = $1
       RETURNING *`,
      [requestId]
    );


    await client.query('COMMIT');
    res.json({ 
      message: "Request accepted successfully", 
      request: updateResult.rows[0] 
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error accepting request:", err);
    res.status(500).json({ error: "Failed to accept request: " + err.message });
  } finally {
    client.release();
  }
});

// Reject a stock request
app.put("/api/stock-requests/:requestId/reject", async (req, res) => {
  const { requestId } = req.params;
  
  console.log(`Rejecting request ID: ${requestId}`);
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if request exists
    const requestCheck = await client.query(
      "SELECT * FROM stock_requests WHERE request_id = $1",
      [requestId]
    );
    
    if (requestCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "Request not found" });
    }

    // Try different status values if 'Rejected' doesn't work
    const result = await client.query(
      `UPDATE stock_requests 
       SET status = 'Rejected',
           delivery_status = 'NotShipped', 
           updated_at = NOW()
       WHERE request_id = $1 
       RETURNING *`,
      [requestId]
    );

    await client.query('COMMIT');
    
    console.log("Update successful:", result.rows[0]);
    res.json({ message: "Request rejected", request: result.rows[0] });
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error rejecting request:", err);
    console.error("Full error details:", err.message, err.stack);
    res.status(500).json({ error: "Failed to reject request: " + err.message });
  } finally {
    client.release();
  }
});

// Reject a stock request - FIXED
// app.put("/api/stock-requests/:requestId/reject", async (req, res) => {
//   const { requestId } = req.params;
//   const { reason } = req.body;
  
//   try {
//     const result = await pool.query(
//       `UPDATE stock_requests 
//        SET status = 'Rejected', 
//            delivery_status = 'Cancelled',
//            notes = COALESCE($2, notes)
//        WHERE request_id = $1 
//        RETURNING *`,
//       [requestId, reason]
//     );
    
//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: "Request not found" });
//     }
    
//     res.json({ message: "Request rejected", request: result.rows[0] });
//   } catch (err) {
//     console.error("Error rejecting request:", err);
//     res.status(500).json({ error: "Failed to reject request" });
//   }
// });

// Ship order - FIXED
app.put("/api/stock-requests/:requestId/ship", async (req, res) => {
  const { requestId } = req.params;
  const { tracking_info } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE stock_requests 
       SET delivery_status = 'Shipped', 
           shipped_date = CURRENT_DATE,
           tracking_info = $1
       WHERE request_id = $2 
       RETURNING *`,
      [tracking_info, requestId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Request not found" });
    }
    
    res.json({ 
      message: "Order shipped successfully!",
      request: result.rows[0]
    });
  } catch (err) {
    console.error("Error shipping order:", err);
    res.status(500).json({ error: "Failed to ship order" });
  }
});

// Mark as delivered - FIXED (reduce supplier inventory)
// app.put("/api/stock-requests/:requestId/deliver", async (req, res) => {
//   const { requestId } = req.params;
  
//   const client = await pool.connect();
//   try {
//     await client.query('BEGIN');

//     const requestResult = await client.query(
//       `SELECT * FROM stock_requests WHERE request_id = $1`,
//       [requestId]
//     );
    
//     if (requestResult.rows.length === 0) {
//       await client.query('ROLLBACK');
//       return res.status(404).json({ error: "Request not found" });
//     }

//     const request = requestResult.rows[0];

//     // Check if request is accepted before delivering
//     if (request.status !== 'Accepted') {
//       await client.query('ROLLBACK');
//       return res.status(400).json({ error: "Can only deliver accepted requests" });
//     }

//     // Check if supplier still has enough inventory
//     const inventoryResult = await client.query(
//       `SELECT * FROM supplier_inventory 
//        WHERE supplier_id = $1 AND medicine_id = $2`,
//       [request.supplier_id, request.medicine_id]
//     );

//     if (inventoryResult.rows.length === 0) {
//       await client.query('ROLLBACK');
//       return res.status(400).json({ error: "Medicine not found in your inventory" });
//     }

//     const inventory = inventoryResult.rows[0];

//     if (inventory.quantity_available < request.quantity_requested) {
//       await client.query('ROLLBACK');
//       return res.status(400).json({ 
//         error: `Insufficient stock. Available: ${inventory.quantity_available}, Requested: ${request.quantity_requested}` 
//       });
//     }

//     // Update delivery status and mark as completed
//     await client.query(
//       `UPDATE stock_requests 
//        SET delivery_status = 'Delivered', 
//            status = 'Completed',
//            delivery_date = CURRENT_TIMESTAMP
//        WHERE request_id = $1`,
//       [requestId]
//     );

//     // Reduce supplier inventory
//     await client.query(
//       `UPDATE supplier_inventory 
//        SET quantity_available = quantity_available - $1,
//            updated_at = NOW()
//        WHERE supplier_id = $2 AND medicine_id = $3`,
//       [request.quantity_requested, request.supplier_id, request.medicine_id]
//     );

//     await client.query('COMMIT');
//     res.json({ 
//       message: "Delivery completed successfully! Inventory updated.",
//       delivered_quantity: request.quantity_requested
//     });
//   } catch (err) {
//     await client.query('ROLLBACK');
//     console.error("Error delivering order:", err);
//     res.status(500).json({ error: "Failed to complete delivery" });
//   } finally {
//     client.release();
//   }
// });

app.put("/api/stock-requests/:requestId/deliver", async (req, res) => {
  const { requestId } = req.params;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const requestResult = await client.query(
      `SELECT * FROM stock_requests WHERE request_id = $1`,
      [requestId]
    );
    
    if (requestResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "Request not found" });
    }

    const request = requestResult.rows[0];

    // Check if request is shipped before delivering
    if (request.delivery_status !== 'Shipped') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: "Can only deliver shipped orders" });
    }

    // Check if supplier still has enough inventory
    const inventoryResult = await client.query(
      `SELECT * FROM supplier_inventory 
       WHERE supplier_id = $1 AND medicine_id = $2`,
      [request.supplier_id, request.medicine_id]
    );

    if (inventoryResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: "Medicine not found in your inventory" });
    }

    const inventory = inventoryResult.rows[0];

    if (inventory.quantity_available < request.quantity_requested) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: `Insufficient stock. Available: ${inventory.quantity_available}, Requested: ${request.quantity_requested}` 
      });
    }

    // Update delivery status and mark as completed
    await client.query(
      `UPDATE stock_requests 
       SET delivery_status = 'Delivered', 
           status = 'Completed',
           delivery_date = CURRENT_TIMESTAMP
       WHERE request_id = $1`,
      [requestId]
    );

    // Reduce supplier inventory
    await client.query(
      `UPDATE supplier_inventory 
       SET quantity_available = quantity_available - $1,
           updated_at = NOW()
       WHERE supplier_id = $2 AND medicine_id = $3`,
      [request.quantity_requested, request.supplier_id, request.medicine_id]
    );

    // Update medicines table stock (add to pharmacist's available medicines)
    await client.query(
      `UPDATE medicines 
       SET stock = stock + $1
       WHERE medicine_id = $2 AND supplier_id = $3`,
      [request.quantity_requested, request.medicine_id, request.supplier_id]
    );

    await client.query('COMMIT');
    res.json({ 
      message: "Delivery completed successfully! Inventory and medicines table updated.",
      delivered_quantity: request.quantity_requested
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error delivering order:", err);
    res.status(500).json({ error: "Failed to complete delivery: " + err.message });
  } finally {
    client.release();
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));