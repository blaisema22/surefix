const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const db = require('../config/db');
const { generateBookingRef, ok, fail } = require('../utils/helpers');

// ── GET /api/appointments ─────────────────────────────────────────────────────
exports.listAppointments = (req, res, next) => {
  try {
    const appointments = db.prepare(`
      SELECT a.*, s.shopName, d.deviceType, svc.serviceName
      FROM appointments a
      JOIN shops s ON s.id = a.shopId
      JOIN devices d ON d.id = a.deviceId
      JOIN services svc ON svc.id = a.serviceId
      WHERE a.customerId = ?
      ORDER BY a.appointmentDate DESC
    `).all(req.user.id);
    return ok(res, appointments);
  } catch (err) { next(err); }
};

// ── GET /api/appointments/:id ────────────────────────────────────────────────
exports.getAppointment = (req, res, next) => {
  try {
    const apt = db.prepare('SELECT * FROM appointments WHERE id = ? AND customerId = ?')
      .get(req.params.id, req.user.id);
    if (!apt) return fail(res, 'Appointment not found', 404);
    return ok(res, apt);
  } catch (err) { next(err); }
};

// ── POST /api/appointments ──────────────────────────────────────────────────
exports.createAppointment = (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return fail(res, errors.array()[0].msg);

    const { shopId, deviceId, serviceId, appointmentDate, notes } = req.body;

    // Verify device belongs to customer
    const device = db.prepare(
      'SELECT id FROM devices WHERE id = ? AND userId = ?'
    ).get(deviceId, req.user.id);
    if (!device) return fail(res, 'Device not found or not yours', 404);

    // Check shop exists
    const shop = db.prepare('SELECT id FROM shops WHERE id = ?').get(shopId);
    if (!shop) return fail(res, 'Shop not found', 404);

    // Check service exists
    const service = db.prepare('SELECT id FROM services WHERE id = ?').get(serviceId);
    if (!service) return fail(res, 'Service not found', 404);

    const id = uuidv4();
    
    db.prepare(`
      INSERT INTO appointments (id, customerId, shopId, deviceId, serviceId, appointmentDate, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, req.user.id, shopId, deviceId, serviceId, appointmentDate, notes || null, 'pending');

    const apt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
    return ok(res, apt, 'Appointment booked successfully', 201);
  } catch (err) { next(err); }
};

// ── PATCH /api/appointments/:id/status ──────────────────────────────────────
exports.updateStatus = (req, res, next) => {
  try {
    const { status } = req.body;
    const VALID = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!VALID.includes(status)) return fail(res, 'Invalid status');

    const apt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
    if (!apt) return fail(res, 'Appointment not found', 404);

    db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run(status, req.params.id);
    const updated = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
    return ok(res, updated, 'Status updated');
  } catch (err) { next(err); }
};

// ── DELETE /api/appointments/:id ────────────────────────────────────────────
exports.cancelAppointment = (req, res, next) => {
  try {
    const apt = db.prepare('SELECT * FROM appointments WHERE id = ? AND customerId = ?')
      .get(req.params.id, req.user.id);
    if (!apt) return fail(res, 'Appointment not found', 404);
    if (apt.status === 'completed') return fail(res, 'Cannot cancel completed appointment');

    db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run('cancelled', req.params.id);
    return ok(res, null, 'Appointment cancelled');
  } catch (err) { next(err); }
};
