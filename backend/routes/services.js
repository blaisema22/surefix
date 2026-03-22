const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// ─── GET /api/services — all services or by centre ────────
router.get('/', async (req, res) => {
  const { centre_id, category, search } = req.query;

  try {
    let query = `
      SELECT s.*, rc.name AS centre_name, rc.district
      FROM services s
      JOIN repair_centres rc ON s.centre_id = rc.centre_id
      WHERE s.is_available = TRUE AND rc.is_active = TRUE
    `;
    const params = [];

    if (centre_id) {
      query += ' AND s.centre_id = ?';
      params.push(centre_id);
    }
    if (category) {
      query += ' AND s.device_category = ?';
      params.push(category);
    }
    if (search) {
      query += ' AND (s.service_name LIKE ? OR s.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY s.service_name ASC LIMIT 100';

    const [services] = await pool.query(query, params);
    res.json({ success: true, services });
  } catch (err) {
    console.error('Get services error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
