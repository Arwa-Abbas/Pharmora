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


// Middleware setup
app.use(express.json());
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



// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
