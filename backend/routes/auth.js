const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/db');
const { sendVerificationEmail } = require('../utils/email');
const authMiddleware = require('../middleware/auth');

const generateToken = () => crypto.randomBytes(32).toString('hex');

// ── POST /api/auth/register ─────────────────────────────────
router.post('/register', [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['customer', 'repairer']).withMessage('Role must be customer or repairer'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0]?.msg || 'Invalid registration data.',
      errors: errors.array(),
    });
  }

  const { email, password, phone } = req.body;
  const role = req.body.role === 'repairer' ? 'repairer' : 'customer';
  const name = req.body.name || email.split('@')[0];

  try {
    const [existing] = await pool.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(409).json({ success: false, message: 'Email already registered.' });

    const password_hash = await bcrypt.hash(password, 12);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, password_hash, phone || null, role]
    );

    const token = jwt.sign(
      { userId: result.insertId, email, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: {
        userId: result.insertId,
        name,
        email,
        phone: phone || null,
        role,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── POST /api/auth/login ────────────────────────────────────
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { email, password } = req.body;

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    const token = jwt.sign(
      { userId: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        userId: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── GET /api/auth/verify-email ──────────────────────────────
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ success: false, message: 'Token required.' });

  try {
    const [users] = await pool.query('SELECT user_id FROM users WHERE verification_token = ?', [token]);
    if (users.length === 0) return res.status(400).json({ success: false, message: 'Invalid or expired token.' });

    await pool.query('UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE user_id = ?', [users[0].user_id]);
    res.json({ success: true, message: 'Email verified. You can now log in.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── GET /api/auth/me ────────────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT user_id, name, email, phone, role, created_at FROM users WHERE user_id = ?',
      [req.user.userId]
    );
    if (users.length === 0) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user: users[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── PUT /api/auth/profile ───────────────────────────────────
router.put('/profile', authMiddleware, [
  body('name').trim().notEmpty().withMessage('Name is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { name, phone } = req.body;
  try {
    await pool.query('UPDATE users SET name = ?, phone = ? WHERE user_id = ?', [name, phone || null, req.user.userId]);
    res.json({ success: true, message: 'Profile updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
