const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { verifyToken } = require('../middleware/auth');

// Add symptom
router.post('/', verifyToken, async (req, res) => {
  try {
    const { symptomType, severity, description } = req.body;

    const result = await db.query(
      'INSERT INTO symptoms (user_id, symptom_type, severity, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.userId, symptomType, severity, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user symptoms
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM symptoms WHERE user_id = $1 ORDER BY recorded_at DESC LIMIT 100',
      [req.userId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
