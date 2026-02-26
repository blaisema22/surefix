const jwt    = require('jsonwebtoken');
const crypto = require('crypto');

// ── Generate access token (short-lived) ──────────────────────────────────────
const generateAccessToken = (userId, role) =>
  jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// ── Generate a random booking reference ─────────────────────────────────────
const generateBookingRef = () => {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `SF-${num}`;
};

// ── Standard API response helpers ────────────────────────────────────────────
const ok   = (res, data, message = 'Success', status = 200) =>
  res.status(status).json({ success: true, message, data });

const fail = (res, message, status = 400) =>
  res.status(status).json({ success: false, message });

module.exports = { generateAccessToken, generateBookingRef, ok, fail };
