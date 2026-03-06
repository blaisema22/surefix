const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { sendBookingConfirmation, sendCancellationEmail } = require('../utils/email');

router.use(authMiddleware);

const generateBookingRef = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let ref = 'SF';
  for (let i = 0; i < 8; i++) ref += chars[Math.floor(Math.random() * chars.length)];
  return ref;
};

// ── GET /api/appointments — customer's own appointments ─────
router.get('/', async (req, res) => {
  const { status } = req.query;

  try {
    let query = `
      SELECT a.*,
        rc.name AS centre_name, rc.address AS centre_address, rc.phone AS centre_phone,
        d.brand AS device_brand, d.model AS device_model, d.device_type,
        s.service_name, s.estimated_price_min, s.estimated_price_max, s.estimated_duration_minutes
      FROM appointments a
      JOIN repair_centres rc ON a.centre_id = rc.centre_id
      JOIN devices d ON a.device_id = d.device_id
      JOIN services s ON a.service_id = s.service_id
      WHERE a.user_id = ?
    `;
    const params = [req.user.userId];
    if (status) { query += ' AND a.status = ?'; params.push(status); }
    query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';

    const [appointments] = await pool.query(query, params);
    res.json({ success: true, appointments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── POST /api/appointments — book ───────────────────────────
router.post('/', [
  body('centre_id').isInt(),
  body('device_id').isInt(),
  body('service_id').isInt(),
  body('appointment_date').isDate(),
  body('appointment_time').matches(/^\d{2}:\d{2}/),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { centre_id, device_id, service_id, appointment_date, appointment_time, notes } = req.body;

  try {
    // Validate device belongs to user
    const [devices] = await pool.query('SELECT device_id FROM devices WHERE device_id = ? AND user_id = ?', [device_id, req.user.userId]);
    if (devices.length === 0) return res.status(403).json({ success: false, message: 'Device not found.' });

    // Validate service at centre
    const [services] = await pool.query(
      'SELECT service_id FROM services WHERE service_id = ? AND centre_id = ? AND is_available = TRUE', [service_id, centre_id]
    );
    if (services.length === 0) return res.status(404).json({ success: false, message: 'Service not available.' });

    // Check slot conflict
    const [conflict] = await pool.query(
      `SELECT appointment_id FROM appointments WHERE centre_id=? AND appointment_date=? AND appointment_time=? AND status NOT IN ('cancelled')`,
      [centre_id, appointment_date, appointment_time]
    );
    if (conflict.length > 0) return res.status(409).json({ success: false, message: 'This time slot is already booked. Please choose another.' });

    // Must be future
    if (new Date(`${appointment_date}T${appointment_time}`) < new Date()) {
      return res.status(400).json({ success: false, message: 'Cannot book appointments in the past.' });
    }

    const booking_reference = generateBookingRef();
    const [result] = await pool.query(
      `INSERT INTO appointments (user_id, centre_id, device_id, service_id, appointment_date, appointment_time, notes, booking_reference)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.userId, centre_id, device_id, service_id, appointment_date, appointment_time, notes || null, booking_reference]
    );

    // Full data for email
    const [full] = await pool.query(`
      SELECT a.*, rc.name AS centre_name, rc.address AS centre_address,
        d.brand AS device_brand, d.model AS device_model,
        s.service_name, u.name AS user_name, u.email AS user_email
      FROM appointments a
      JOIN repair_centres rc ON a.centre_id = rc.centre_id
      JOIN devices d ON a.device_id = d.device_id
      JOIN services s ON a.service_id = s.service_id
      JOIN users u ON a.user_id = u.user_id
      WHERE a.appointment_id = ?
    `, [result.insertId]);

    const appt = full[0];
    sendBookingConfirmation({ to: appt.user_email, name: appt.user_name, appointment: appt }).catch(console.error);

    res.status(201).json({
      success: true,
      message: 'Appointment booked! A confirmation email has been sent.',
      appointment: { appointment_id: result.insertId, booking_reference, status: 'pending' },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── PATCH /api/appointments/:id/cancel ──────────────────────
router.patch('/:id/cancel', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.*, rc.name AS centre_name, rc.address AS centre_address,
        u.name AS user_name, u.email AS user_email
      FROM appointments a
      JOIN repair_centres rc ON a.centre_id = rc.centre_id
      JOIN users u ON a.user_id = u.user_id
      WHERE a.appointment_id = ? AND a.user_id = ?
    `, [req.params.id, req.user.userId]);

    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Appointment not found.' });
    const appt = rows[0];

    if (appt.status === 'cancelled') return res.status(400).json({ success: false, message: 'Already cancelled.' });
    if (['completed', 'in_progress'].includes(appt.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel a ${appt.status} appointment.` });
    }

    await pool.query('UPDATE appointments SET status = ? WHERE appointment_id = ?', ['cancelled', req.params.id]);
    sendCancellationEmail({ to: appt.user_email, name: appt.user_name, appointment: appt }).catch(console.error);

    res.json({ success: true, message: 'Appointment cancelled. Confirmation email sent.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
