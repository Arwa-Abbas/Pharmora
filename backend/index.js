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
app.get('/api/pharmacists', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE role = $1', ['pharmacist']);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch pharmacists' });
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

// ADD THIS ENDPOINT - Make sure it's exactly here
// Get orders without prescriptions for a patient (including current order if editing)
app.get("/api/patient/:patientId/orders-without-prescriptions", async (req, res) => {
  const { patientId } = req.params;
  const { excludePrescriptionId } = req.query; // Optional: exclude orders linked to a specific prescription (for editing)
  
  try {
    let query = `
      SELECT o.* 
      FROM orders o
      WHERE o.user_id = $1 
      AND (o.prescription_id IS NULL OR o.prescription_id = 0)
    `;
    let params = [patientId];
    
    // If excluding a specific prescription, include orders linked to that prescription
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

    // First, get the current prescription to check the old order_id
    const currentPrescription = await client.query(
      "SELECT order_id FROM prescriptions WHERE prescription_id = $1",
      [prescriptionId]
    );
    
    if (currentPrescription.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "Prescription not found" });
    }

    const oldOrderId = currentPrescription.rows[0].order_id;

    // Update the prescription
    const result = await client.query(
      `UPDATE prescriptions 
       SET doctor_id = $1, prescription_image = $2, notes = $3, order_id = $4
       WHERE prescription_id = $5 
       RETURNING *`,
      [doctor_id, prescription_image, notes, order_id, prescriptionId]
    );

    // Remove prescription_id from the old order (if it existed)
    if (oldOrderId) {
      await client.query(
        "UPDATE orders SET prescription_id = NULL WHERE order_id = $1 AND prescription_id = $2",
        [oldOrderId, prescriptionId]
      );
    }

    // Add prescription_id to the new order
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
// IMPORTANT: Specific routes MUST come before parameterized routes!

// Get pending prescriptions for specific doctor's specialty
app.get("/api/doctor/pending-prescriptions/:doctorId", async (req, res) => {
  const { doctorId } = req.params;
  try {
    // First get doctor's specialty
    const doctorResult = await pool.query(
      `SELECT specialty FROM doctors WHERE user_id = $1`,
      [doctorId]
    );
    
    if (doctorResult.rows.length === 0) {
      return res.status(404).json({ error: "Doctor not found" });
    }
    
    const doctorSpecialty = doctorResult.rows[0].specialty;
    
    // Get pending prescriptions that either:
    // 1. Have this doctor assigned (doctor_id = current doctor)
    // 2. OR have no doctor assigned but we can match by specialty logic
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
    
    // Filter by specialty on backend for more control
    const filteredPrescriptions = result.rows.filter(prescription => {
      // If prescription has a doctor assigned, only show if it's the current doctor
      if (prescription.doctor_id) {
        return prescription.doctor_id === parseInt(doctorId);
      }
      // If no doctor assigned, show to all doctors for now
      // You can add specialty-based filtering here later if needed
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

    // Get doctor's assigned patients count
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

// Get doctor's own patients (patients who have this doctor as primary or have prescriptions from this doctor)
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

// Get all patients for dropdown (when creating new prescriptions)
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

// Get all patients (for compatibility - but doctors should use the filtered endpoints above)
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

    // Create prescription
    const presResult = await client.query(
      `INSERT INTO prescriptions (patient_id, doctor_id, date_issued, status, prescription_image, notes, diagnosis)
       VALUES ($1, $2, CURRENT_DATE, 'Verified', $3, $4, $5) RETURNING *`,
      [patient_id, doctor_id, prescription_image || null, notes || '', diagnosis || '']
    );

    const prescriptionId = presResult.rows[0].prescription_id;

    // Add prescribed medicines
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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));