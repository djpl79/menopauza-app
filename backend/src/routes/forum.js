const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { verifyToken } = require('../middleware/auth');

// Get all posts
router.get('/posts', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT p.*, u.username FROM forum_posts p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC LIMIT 50'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create post
router.post('/posts', verifyToken, async (req, res) => {
  try {
    const { title, content } = req.body;

    const result = await db.query(
      'INSERT INTO forum_posts (user_id, title, content) VALUES ($1, $2, $3) RETURNING *',
      [req.userId, title, content]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add comment
router.post('/posts/:postId/comments', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;
    const { postId } = req.params;

    const result = await db.query(
      'INSERT INTO forum_comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
      [postId, req.userId, content]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
