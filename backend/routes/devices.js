const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/db');
const authMiddleware = require('../middleware/auth');

// All device routes require authentication
router.use(authMiddleware);

// ─── GET /api/devices — get user's devices ─────────────────
router.get('/', async (req, res) => {
  try {
    const [devices] = await pool.query(
      'SELECT * FROM devices WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json({ success: true, devices });
  } catch (err) {
    console.error('Get devices error:', err);
    res.status(500).json({ success: false, message: 'Unable to load your devices. Please try again later.' });
  }
});

// ─── POST /api/devices — add a new device ──────────────────
router.post('/', [
  body('brand').trim().notEmpty().withMessage('Brand is required'),
  body('model').trim().notEmpty().withMessage('Model is required'),
  body('device_type').isIn(['smartphone','tablet','laptop','desktop','other']).withMessage('Invalid device type. Must be smartphone, tablet, laptop, desktop, or other'),
  body('issue_description').trim().notEmpty().withMessage('Issue description is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation failed. Please check your input.',
      errors: errors.array() 
    });
  }

  const { brand, model, device_type, serial_number, purchase_year, issue_description } = req.body;

  try {
    const [result] = await pool.query(
      'INSERT INTO devices (user_id, brand, model, device_type, serial_number, purchase_year, issue_description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.userId, brand, model, device_type, serial_number || null, purchase_year || null, issue_description]
    );

    const [newDevice] = await pool.query('SELECT * FROM devices WHERE device_id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Device added successfully!', device: newDevice[0] });
  } catch (err) {
    console.error('Add device error:', err);
    res.status(500).json({ success: false, message: 'Unable to add device. Please try again later.' });
  }
});

// ─── PUT /api/devices/:id — update a device ────────────────
router.put('/:id', [
  body('brand').trim().notEmpty().withMessage('Brand is required'),
  body('model').trim().notEmpty().withMessage('Model is required'),
  body('device_type').isIn(['smartphone','tablet','laptop','desktop','other']).withMessage('Invalid device type. Must be smartphone, tablet, laptop, desktop, or other'),
  body('issue_description').trim().notEmpty().withMessage('Issue description is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation failed. Please check your input.',
      errors: errors.array() 
    });
  }

  const { brand, model, device_type, serial_number, purchase_year, issue_description } = req.body;

  try {
    const [devices] = await pool.query(
      'SELECT device_id FROM devices WHERE device_id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );
    if (devices.length === 0) return res.status(404).json({ success: false, message: 'Device not found.' });

    await pool.query(
      'UPDATE devices SET brand=?, model=?, device_type=?, serial_number=?, purchase_year=?, issue_description=? WHERE device_id=?',
      [brand, model, device_type, serial_number || null, purchase_year || null, issue_description, req.params.id]
    );

    res.json({ success: true, message: 'Device updated successfully!' });
  } catch (err) {
    console.error('Update device error:', err);
    res.status(500).json({ success: false, message: 'Unable to update device. Please try again later.' });
  }
});

// ─── DELETE /api/devices/:id — delete a device ─────────────
router.delete('/:id', async (req, res) => {
  try {
    const [devices] = await pool.query(
      'SELECT device_id FROM devices WHERE device_id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );
    if (devices.length === 0) return res.status(404).json({ success: false, message: 'Device not found.' });

    await pool.query('DELETE FROM devices WHERE device_id = ?', [req.params.id]);
    res.json({ success: true, message: 'Device deleted successfully!' });
  } catch (err) {
    console.error('Delete device error:', err);
    res.status(500).json({ success: false, message: 'Unable to delete device. Please try again later.' });
  }
});

module.exports = router;
