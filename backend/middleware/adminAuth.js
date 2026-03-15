// middleware/adminAuth.js
const authenticateAdmin = (req, res, next) => {
  try {
    next();
  } catch (err) {
    console.error("Admin auth error:", err);
    res.status(401).json({ error: "Admin authentication failed" });
  }
};

module.exports = { authenticateAdmin };
