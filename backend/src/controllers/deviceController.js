const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const db = require('../config/db');
const { ok, fail } = require('../utils/helpers');
const { v4: uuidv4 } = require('uuid');

// ── GET /api/devices ──────────────────────────────────────────────────────────
exports.getDevices = (req, res, next) => {
    try {
        const devices = db.prepare('SELECT * FROM devices WHERE userId = ? ORDER BY createdAt DESC').all(req.user.id);
        return ok(res, devices);
    } catch (err) { next(err); }
};

// ── GET /api/devices/:id ──────────────────────────────────────────────────────
exports.getDevice = (req, res, next) => {
    try {
        const device = db.prepare('SELECT * FROM devices WHERE id = ? AND userId = ?').get(req.params.id, req.user.id);
        if (!device) return fail(res, 'Device not found', 404);
        return ok(res, device);
    } catch (err) { next(err); }
};

// ── POST /api/devices ─────────────────────────────────────────────────────────
exports.createDevice = (req, res, next) => {
    try {
        const { deviceType, brand, model, serialNumber, issueDescription } = req.body;
        const id = uuidv4();

        db.prepare(`
      INSERT INTO devices (id, userId, deviceType, brand, model, serialNumber, issueDescription)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, req.user.id, deviceType, brand, model, serialNumber, issueDescription);

        const device = db.prepare('SELECT * FROM devices WHERE id = ?').get(id);
        return ok(res, device, 'Device created', 201);
    } catch (err) { next(err); }
};

// ── PUT /api/devices/:id ──────────────────────────────────────────────────────
exports.updateDevice = (req, res, next) => {
    try {
        const device = db.prepare('SELECT * FROM devices WHERE id = ? AND userId = ?').get(req.params.id, req.user.id);
        if (!device) return fail(res, 'Device not found', 404);

        const { deviceType, brand, model, serialNumber, issueDescription } = req.body;
        db.prepare(`
      UPDATE devices SET deviceType = ?, brand = ?, model = ?, serialNumber = ?, issueDescription = ?
      WHERE id = ?
    `).run(deviceType || device.deviceType, brand || device.brand, model || device.model, serialNumber || device.serialNumber, issueDescription || device.issueDescription, req.params.id);

        const updated = db.prepare('SELECT * FROM devices WHERE id = ?').get(req.params.id);
        return ok(res, updated);
    } catch (err) { next(err); }
};

// ── DELETE /api/devices/:id ───────────────────────────────────────────────────
exports.deleteDevice = (req, res, next) => {
    try {
        const device = db.prepare('SELECT * FROM devices WHERE id = ? AND userId = ?').get(req.params.id, req.user.id);
        if (!device) return fail(res, 'Device not found', 404);

        db.prepare('DELETE FROM devices WHERE id = ?').run(req.params.id);
        return ok(res, null, 'Device deleted');
    } catch (err) { next(err); }
};

const { ok, fail } = require('../utils/helpers');

// ── GET /api/devices ── (customer's own devices) ─────────────────────────────
exports.listDevices = async(req, res, next) => {
    try {
        const [rows] = await pool.query(
            `SELECT id, name, device_type AS type, brand, model, serial_number AS serial,
              status, issue_desc AS issue, added_at, created_at
       FROM devices
       WHERE customer_id = ?
       ORDER BY created_at DESC`, [req.user.id]
        );
        return ok(res, rows);
    } catch (err) { next(err); }
};

// ── GET /api/devices/:id ─────────────────────────────────────────────────────
exports.getDevice = async(req, res, next) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM devices WHERE id = ? AND customer_id = ?', [req.params.id, req.user.id]
        );
        if (!rows.length) return fail(res, 'Device not found', 404);
        return ok(res, rows[0]);
    } catch (err) { next(err); }
};

// ── POST /api/devices ────────────────────────────────────────────────────────
exports.createDevice = async(req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return fail(res, errors.array()[0].msg);

        const { name, deviceType, brand, model, serialNumber, issueDesc } = req.body;
        const id = uuidv4();

        await pool.query(
            `INSERT INTO devices (id, customer_id, name, device_type, brand, model, serial_number, issue_desc)
       VALUES (?,?,?,?,?,?,?,?)`, [id, req.user.id, name, deviceType, brand, model, serialNumber || null, issueDesc || null]
        );

        const [rows] = await pool.query('SELECT * FROM devices WHERE id = ?', [id]);
        return ok(res, rows[0], 'Device registered', 201);
    } catch (err) { next(err); }
};

// ── PUT /api/devices/:id ─────────────────────────────────────────────────────
exports.updateDevice = async(req, res, next) => {
    try {
        const [check] = await pool.query(
            'SELECT id FROM devices WHERE id = ? AND customer_id = ?', [req.params.id, req.user.id]
        );
        if (!check.length) return fail(res, 'Device not found', 404);

        const { name, brand, model, serialNumber, status, issueDesc } = req.body;
        await pool.query(
            `UPDATE devices SET
         name          = COALESCE(?, name),
         brand         = COALESCE(?, brand),
         model         = COALESCE(?, model),
         serial_number = COALESCE(?, serial_number),
         status        = COALESCE(?, status),
         issue_desc    = COALESCE(?, issue_desc)
       WHERE id = ?`, [name, brand, model, serialNumber, status, issueDesc, req.params.id]
        );

        const [rows] = await pool.query('SELECT * FROM devices WHERE id = ?', [req.params.id]);
        return ok(res, rows[0], 'Device updated');
    } catch (err) { next(err); }
};

// ── DELETE /api/devices/:id ──────────────────────────────────────────────────
exports.deleteDevice = async(req, res, next) => {
    try {
        const [check] = await pool.query(
            'SELECT id FROM devices WHERE id = ? AND customer_id = ?', [req.params.id, req.user.id]
        );
        if (!check.length) return fail(res, 'Device not found', 404);

        await pool.query('DELETE FROM devices WHERE id = ?', [req.params.id]);
        return ok(res, null, 'Device deleted');
    } catch (err) { next(err); }
};