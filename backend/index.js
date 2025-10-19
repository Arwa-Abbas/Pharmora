// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    await pool.query('SELECT 1');
    console.log('Connected to Postgres (Supabase) successfully');
  } catch (err) {
    console.error('DB connection failed:', err.message || err);
  }
})();

// Routes
app.get('/products', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM public.products ORDER BY product_id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/products', async (req, res) => {
  const { name, price, description } = req.body;
  try {
    const insert = await pool.query(
      'INSERT INTO public.products (name, price, description) VALUES ($1,$2,$3) RETURNING *',
      [name, price, description]
    );
    res.status(201).json(insert.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to insert product' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
