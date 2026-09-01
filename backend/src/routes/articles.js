const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Get all articles
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM articles ORDER BY created_at DESC';
    const values = [];

    if (category) {
      query = 'SELECT * FROM articles WHERE category = $1 ORDER BY created_at DESC';
      values.push(category);
    }

    const result = await db.query(query, values);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single article
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM articles WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
