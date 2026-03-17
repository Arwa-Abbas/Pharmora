
const { pool } = require('../config/database');

const getCart = async (req, res) => {
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
};

const addToCart = async (req, res) => {
  const { user_id, medicine_id, quantity } = req.body;
  try {
    const existing = await pool.query(
      "SELECT * FROM cart_items WHERE user_id = $1 AND medicine_id = $2",
      [user_id, medicine_id]
    );

    if (existing.rows.length > 0) {
      const result = await pool.query(
        "UPDATE cart_items SET quantity = quantity + $1 WHERE user_id = $2 AND medicine_id = $3 RETURNING *",
        [quantity, user_id, medicine_id]
      );
      res.json(result.rows[0]);
    } else {
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
};

const updateCartItem = async (req, res) => {
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
};

const removeFromCart = async (req, res) => {
  const { cartItemId } = req.params;
  try {
    await pool.query("DELETE FROM cart_items WHERE cart_item_id = $1", [cartItemId]);
    res.json({ message: "Item removed from cart" });
  } catch (err) {
    console.error("Error removing from cart:", err);
    res.status(500).json({ error: "Failed to remove from cart" });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart
};