// middleware/auth.js
const { pool } = require('../config/database');

const authenticateUser = async (req, res, next) => {
  next();
};

module.exports = { authenticateUser };
