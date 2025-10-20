// Load environment variables
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const dns = require('dns');
const path = require('path');

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



// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
