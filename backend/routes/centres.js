const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/db');
const authMiddleware = require('../middleware/auth');

// ── Middleware: require repairer role ───────────────────────
const requireRepairer = (req, res, next) => {
  if (!['repairer', 'admin'].includes(req.user?.role)) {
    return res.status(403).json({ success: false, message: 'Repairer access required.' });
  }
  next();
};

// ── Middleware: require admin role ──────────────────────────
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required.' });
  }
  next();
};

// ──────────────────────────────────────────────────────────────
// PUBLIC: GET /api/centres — search centres (only visible+active shown to customers)
// ──────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  const { search, lat, lng, radius = 20 } = req.query;

  try {
    let query, params;

    if (lat && lng) {
      query = `
        SELECT c.*, u.name AS owner_name,
          (6371 * ACOS(
            COS(RADIANS(?)) * COS(RADIANS(latitude)) *
            COS(RADIANS(longitude) - RADIANS(?)) +
            SIN(RADIANS(?)) * SIN(RADIANS(latitude))
          )) AS distance_km,
          COUNT(s.service_id) AS service_count
        FROM repair_centres c
        LEFT JOIN users u ON c.owner_id = u.user_id
        LEFT JOIN services s ON c.centre_id = s.centre_id AND s.is_available = TRUE
        WHERE c.is_active = TRUE AND c.is_visible = TRUE
        HAVING distance_km < ?
        GROUP BY c.centre_id
        ORDER BY distance_km ASC
      `;
      params = [lat, lng, lat, parseFloat(radius)];
    } else if (search) {
      query = `
        SELECT c.*, u.name AS owner_name, COUNT(s.service_id) AS service_count
        FROM repair_centres c
        LEFT JOIN users u ON c.owner_id = u.user_id
        LEFT JOIN services s ON c.centre_id = s.centre_id AND s.is_available = TRUE
        WHERE c.is_active = TRUE AND c.is_visible = TRUE
          AND (c.name LIKE ? OR c.address LIKE ? OR c.district LIKE ?)
        GROUP BY c.centre_id
        ORDER BY c.name ASC
      `;
      const like = `%${search}%`;
      params = [like, like, like];
    } else {
      query = `
        SELECT c.*, u.name AS owner_name, COUNT(s.service_id) AS service_count
        FROM repair_centres c
        LEFT JOIN users u ON c.owner_id = u.user_id
        LEFT JOIN services s ON c.centre_id = s.centre_id AND s.is_available = TRUE
        WHERE c.is_active = TRUE AND c.is_visible = TRUE
        GROUP BY c.centre_id
        ORDER BY c.name ASC
      `;
      params = [];
    }

    const [centres] = await pool.query(query, params);
    // Return empty array gracefully instead of throwing error
    res.json({ success: true, centres });
  } catch (err) {
    console.error('Get centres error:', err);
    res.status(500).json({ success: false, message: 'Unable to load repair centres. Please try again later.' });
  }
});

// ──────────────────────────────────────────────────────────────
// PUBLIC: GET /api/centres/:id — single centre with services
// ──────────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [centres] = await pool.query(
      `SELECT c.*, u.name AS owner_name, u.email AS owner_email, u.phone AS owner_phone
       FROM repair_centres c
       LEFT JOIN users u ON c.owner_id = u.user_id
       WHERE c.centre_id = ? AND c.is_visible = TRUE AND c.is_active = TRUE`,
      [req.params.id]
    );
    if (centres.length === 0) return res.status(404).json({ success: false, message: 'Centre not found.' });

    const [services] = await pool.query(
      'SELECT * FROM services WHERE centre_id = ? AND is_available = TRUE ORDER BY device_category, service_name',
      [req.params.id]
    );

    res.json({ success: true, centre: centres[0], services });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ──────────────────────────────────────────────────────────────
// PUBLIC: GET /api/centres/:id/availability
// ──────────────────────────────────────────────────────────────
router.get('/:id/availability', async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ success: false, message: 'Date required (YYYY-MM-DD).' });

  try {
    const [centres] = await pool.query(
      'SELECT opening_time, closing_time FROM repair_centres WHERE centre_id = ? AND is_active = TRUE AND is_visible = TRUE',
      [req.params.id]
    );
    if (centres.length === 0) return res.status(404).json({ success: false, message: 'Centre not found.' });

    const { opening_time, closing_time } = centres[0];
    const slots = [];
    const [openH, openM] = opening_time.split(':').map(Number);
    const [closeH] = closing_time.split(':').map(Number);
    for (let h = openH; h < closeH; h++) {
      slots.push(`${String(h).padStart(2, '0')}:${String(openM).padStart(2, '0')}:00`);
    }

    const [booked] = await pool.query(
      `SELECT appointment_time FROM appointments WHERE centre_id = ? AND appointment_date = ? AND status NOT IN ('cancelled')`,
      [req.params.id, date]
    );
    const bookedTimes = booked.map(b => b.appointment_time.slice(0, 8));
    const available = slots.filter(s => !bookedTimes.includes(s));

    res.json({ success: true, date, available_slots: available, booked_slots: bookedTimes });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ══════════════════════════════════════════════════════════════
// REPAIRER: Manage their own centre
// ══════════════════════════════════════════════════════════════

// GET /api/centres/my/centre — repairer's own centre
router.get('/my/centre', authMiddleware, requireRepairer, async (req, res) => {
  try {
    const [centres] = await pool.query(
      `SELECT c.*, COUNT(s.service_id) AS service_count
       FROM repair_centres c
       LEFT JOIN services s ON c.centre_id = s.centre_id
       WHERE c.owner_id = ?
       GROUP BY c.centre_id`,
      [req.user.userId]
    );
    const [services] = centres.length
      ? await pool.query('SELECT * FROM services WHERE centre_id = ? ORDER BY device_category, service_name', [centres[0]?.centre_id])
      : [[]];

    res.json({ success: true, centre: centres[0] || null, services });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// POST /api/centres/my/centre — create centre (repairer)
router.post('/my/centre', authMiddleware, requireRepairer, [
  body('name').trim().notEmpty().withMessage('Centre name required'),
  body('address').trim().notEmpty().withMessage('Address required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { name, address, district, latitude, longitude, phone, email, opening_time, closing_time, working_days, description } = req.body;

  try {
    // Only one centre per repairer
    const [existing] = await pool.query('SELECT centre_id FROM repair_centres WHERE owner_id = ?', [req.user.userId]);
    if (existing.length > 0) return res.status(409).json({ success: false, message: 'You already have a registered repair centre.' });

    const [result] = await pool.query(
      `INSERT INTO repair_centres (owner_id, name, address, district, latitude, longitude, phone, email, opening_time, closing_time, working_days, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.userId, name, address, district || null, latitude || null, longitude || null,
        phone || null, email || null, opening_time || '08:00:00', closing_time || '18:00:00',
        working_days || 'Mon-Sat', description || null]
    );
    res.status(201).json({ success: true, message: 'Repair centre registered successfully!', centreId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// PUT /api/centres/my/centre — update repairer's own centre
router.put('/my/centre', authMiddleware, requireRepairer, async (req, res) => {
  const { name, address, district, latitude, longitude, phone, email, opening_time, closing_time, working_days, description, is_active } = req.body;

  try {
    const [centres] = await pool.query('SELECT centre_id FROM repair_centres WHERE owner_id = ?', [req.user.userId]);
    if (centres.length === 0) return res.status(404).json({ success: false, message: 'No centre found.' });

    await pool.query(
      `UPDATE repair_centres SET name=?, address=?, district=?, latitude=?, longitude=?, phone=?,
        email=?, opening_time=?, closing_time=?, working_days=?, description=?, is_active=?
       WHERE owner_id=?`,
      [name, address, district || null, latitude || null, longitude || null, phone || null,
        email || null, opening_time || '08:00:00', closing_time || '18:00:00',
        working_days || 'Mon-Sat', description || null, is_active !== undefined ? is_active : true,
        req.user.userId]
    );
    res.json({ success: true, message: 'Centre updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── REPAIRER: Manage own services ──────────────────────────

// GET /api/centres/my/services
router.get('/my/services', authMiddleware, requireRepairer, async (req, res) => {
  try {
    const [centres] = await pool.query('SELECT centre_id FROM repair_centres WHERE owner_id = ?', [req.user.userId]);
    if (centres.length === 0) return res.json({ success: true, services: [] });

    const [services] = await pool.query(
      'SELECT * FROM services WHERE centre_id = ? ORDER BY device_category, service_name',
      [centres[0].centre_id]
    );
    res.json({ success: true, services, centreId: centres[0].centre_id });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// POST /api/centres/my/services
router.post('/my/services', authMiddleware, requireRepairer, [
  body('service_name').trim().notEmpty(),
  body('device_category').isIn(['smartphone','tablet','laptop','desktop','other']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const [centres] = await pool.query('SELECT centre_id FROM repair_centres WHERE owner_id = ?', [req.user.userId]);
    if (centres.length === 0) return res.status(404).json({ success: false, message: 'Register your centre first.' });

    const { service_name, description, device_category, estimated_price_min, estimated_price_max, estimated_duration_minutes } = req.body;

    const [result] = await pool.query(
      `INSERT INTO services (centre_id, service_name, description, device_category, estimated_price_min, estimated_price_max, estimated_duration_minutes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [centres[0].centre_id, service_name, description || null, device_category,
        estimated_price_min || null, estimated_price_max || null, estimated_duration_minutes || 60]
    );
    res.status(201).json({ success: true, message: 'Service added.', serviceId: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// PUT /api/centres/my/services/:id
router.put('/my/services/:id', authMiddleware, requireRepairer, async (req, res) => {
  try {
    const [centres] = await pool.query('SELECT centre_id FROM repair_centres WHERE owner_id = ?', [req.user.userId]);
    if (centres.length === 0) return res.status(404).json({ success: false, message: 'Centre not found.' });

    const { service_name, description, device_category, estimated_price_min, estimated_price_max, estimated_duration_minutes, is_available } = req.body;

    await pool.query(
      `UPDATE services SET service_name=?, description=?, device_category=?, estimated_price_min=?,
        estimated_price_max=?, estimated_duration_minutes=?, is_available=?
       WHERE service_id=? AND centre_id=?`,
      [service_name, description || null, device_category, estimated_price_min || null,
        estimated_price_max || null, estimated_duration_minutes || 60, is_available !== undefined ? is_available : true,
        req.params.id, centres[0].centre_id]
    );
    res.json({ success: true, message: 'Service updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// DELETE /api/centres/my/services/:id
router.delete('/my/services/:id', authMiddleware, requireRepairer, async (req, res) => {
  try {
    const [centres] = await pool.query('SELECT centre_id FROM repair_centres WHERE owner_id = ?', [req.user.userId]);
    if (centres.length === 0) return res.status(404).json({ success: false, message: 'Centre not found.' });

    await pool.query('DELETE FROM services WHERE service_id = ? AND centre_id = ?', [req.params.id, centres[0].centre_id]);
    res.json({ success: true, message: 'Service deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// REPAIRER: view appointments booked at their centre
router.get('/my/appointments', authMiddleware, requireRepairer, async (req, res) => {
  try {
    const [centres] = await pool.query('SELECT centre_id FROM repair_centres WHERE owner_id = ?', [req.user.userId]);
    if (centres.length === 0) return res.json({ success: true, appointments: [] });

    const [appointments] = await pool.query(`
      SELECT a.*,
        u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
        d.brand AS device_brand, d.model AS device_model, d.device_type,
        s.service_name
      FROM appointments a
      JOIN users u ON a.user_id = u.user_id
      JOIN devices d ON a.device_id = d.device_id
      JOIN services s ON a.service_id = s.service_id
      WHERE a.centre_id = ?
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `, [centres[0].centre_id]);

    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// REPAIRER: update appointment status
router.patch('/my/appointments/:id/status', authMiddleware, requireRepairer, async (req, res) => {
  const { status } = req.body;
  const allowed = ['confirmed', 'in_progress', 'completed', 'cancelled'];
  if (!allowed.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status.' });

  try {
    const [centres] = await pool.query('SELECT centre_id FROM repair_centres WHERE owner_id = ?', [req.user.userId]);
    if (centres.length === 0) return res.status(404).json({ success: false, message: 'Centre not found.' });

    await pool.query(
      'UPDATE appointments SET status = ? WHERE appointment_id = ? AND centre_id = ?',
      [status, req.params.id, centres[0].centre_id]
    );
    res.json({ success: true, message: 'Status updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ══════════════════════════════════════════════════════════════
// ADMIN: Full centre management + visibility toggle
// ══════════════════════════════════════════════════════════════

// GET /api/centres/admin/all — ALL centres including hidden
router.get('/admin/all', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const [centres] = await pool.query(`
      SELECT c.*, u.name AS owner_name, u.email AS owner_email, u.phone AS owner_phone,
        COUNT(DISTINCT s.service_id) AS service_count,
        COUNT(DISTINCT a.appointment_id) AS appointment_count
      FROM repair_centres c
      LEFT JOIN users u ON c.owner_id = u.user_id
      LEFT JOIN services s ON c.centre_id = s.centre_id
      LEFT JOIN appointments a ON c.centre_id = a.centre_id
      GROUP BY c.centre_id
      ORDER BY c.created_at DESC
    `);
    res.json({ success: true, centres });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// PATCH /api/centres/admin/:id/visibility — toggle is_visible
router.patch('/admin/:id/visibility', authMiddleware, requireAdmin, async (req, res) => {
  const { is_visible } = req.body;
  if (is_visible === undefined) return res.status(400).json({ success: false, message: 'is_visible required.' });

  try {
    await pool.query('UPDATE repair_centres SET is_visible = ? WHERE centre_id = ?', [is_visible, req.params.id]);
    res.json({
      success: true,
      message: is_visible ? 'Centre is now visible to customers.' : 'Centre is now hidden from customers.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/centres/admin/users — list all users
router.get('/admin/users', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT user_id, name, email, phone, role, is_verified, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/centres/admin/stats — platform-wide stats
router.get('/admin/stats', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const [[{ total_users }]] = await pool.query('SELECT COUNT(*) AS total_users FROM users');
    const [[{ total_customers }]] = await pool.query("SELECT COUNT(*) AS total_customers FROM users WHERE role = 'customer'");
    const [[{ total_repairers }]] = await pool.query("SELECT COUNT(*) AS total_repairers FROM users WHERE role = 'repairer'");
    const [[{ total_centres }]] = await pool.query('SELECT COUNT(*) AS total_centres FROM repair_centres');
    const [[{ visible_centres }]] = await pool.query('SELECT COUNT(*) AS visible_centres FROM repair_centres WHERE is_visible = TRUE');
    const [[{ total_appointments }]] = await pool.query('SELECT COUNT(*) AS total_appointments FROM appointments');
    const [[{ total_services }]] = await pool.query('SELECT COUNT(*) AS total_services FROM services');

    res.json({
      success: true,
      stats: { total_users, total_customers, total_repairers, total_centres, visible_centres, total_appointments, total_services },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
