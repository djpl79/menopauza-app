const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { verifyToken } = require('../middleware/auth');

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const result = await db.query('SELECT id, username, email, first_name, last_name, age, created_at FROM users WHERE id = $1', [
      req.userId,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { firstName, lastName, age } = req.body;

    const result = await db.query(
      'UPDATE users SET first_name = $1, last_name = $2, age = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [firstName, lastName, age, req.userId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
