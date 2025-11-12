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

app.get("/suppliers", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM suppliers");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching suppliers:", err);
    res.status(500).json({ error: "Failed to fetch suppliers" });
  }
});


// Get all doctors
app.get('/api/doctors', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE role = $1', ['doctor']);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch doctors' });
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
// Upload prescription
app.post("/api/prescriptions", async (req, res) => {
  const { patient_id, doctor_id, prescription_image, notes } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO prescriptions (patient_id, doctor_id, date_issued, status, prescription_image, notes)
       VALUES ($1, $2, CURRENT_DATE, 'Pending', $3, $4) RETURNING *`,
      [patient_id, doctor_id || null, prescription_image, notes || '']
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
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
