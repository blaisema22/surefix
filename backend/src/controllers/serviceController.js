const db = require('../config/db');
const { ok, fail } = require('../utils/helpers');
const { v4: uuidv4 } = require('uuid');

// ── GET /api/services ─────────────────────────────────────────────────────────
exports.getServices = (req, res, next) => {
    try {
        const services = db.prepare('SELECT * FROM services ORDER BY serviceName').all();
        return ok(res, services);
    } catch (err) { next(err); }
};

// ── GET /api/services/:id ────────────────────────────────────────────────────
exports.getService = (req, res, next) => {
    try {
        const service = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
        if (!service) return fail(res, 'Service not found', 404);
        return ok(res, service);
    } catch (err) { next(err); }
};

// ── POST /api/services ───────────────────────────────────────────────────────
exports.createService = (req, res, next) => {
    try {
        const { serviceName, description, estimatedTime, price } = req.body;

        const shop = db.prepare('SELECT id FROM shops WHERE userId = ?').get(req.user.id);
        if (!shop) return fail(res, 'Shop not found', 404);

        const id = uuidv4();
        db.prepare(`
      INSERT INTO services (id, shopId, serviceName, description, estimatedTime, price)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, shop.id, serviceName, description, estimatedTime, price);

        const service = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
        return ok(res, service, 'Service created', 201);
    } catch (err) { next(err); }
};

// ── PUT /api/services/:id ───────────────────────────────────────────────────
exports.updateService = (req, res, next) => {
    try {
        const { serviceName, description, estimatedTime, price } = req.body;

        const service = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
        if (!service) return fail(res, 'Service not found', 404);

        db.prepare(`
      UPDATE services SET serviceName = ?, description = ?, estimatedTime = ?, price = ?
      WHERE id = ?
    `).run(serviceName || service.serviceName, description || service.description, estimatedTime || service.estimatedTime, price || service.price, req.params.id);

        const updated = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
        return ok(res, updated);
    } catch (err) { next(err); }
};

const { v4: uuidv4 } = require('uuid');
const { ok, fail } = require('../utils/helpers');

// ── GET /api/services ─────────────────────────────────────────────────────────
exports.listServices = async(req, res, next) => {
    try {
        const { category } = req.query;
        let sql = 'SELECT * FROM services WHERE is_active = 1';
        const params = [];
        if (category) { sql += ' AND category = ?';
            params.push(category); }
        sql += ' ORDER BY category, name';
        const [rows] = await pool.query(sql, params);
        return ok(res, rows);
    } catch (err) { next(err); }
};

// ── GET /api/services/:id ─────────────────────────────────────────────────────
exports.getService = async(req, res, next) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM services WHERE id = ? AND is_active = 1', [req.params.id]
        );
        if (!rows.length) return fail(res, 'Service not found', 404);
        return ok(res, rows[0]);
    } catch (err) { next(err); }
};

// ── POST /api/services ── (admin only — shop can extend later) ────────────────
exports.createService = async(req, res, next) => {
    try {
        const { category, name, durationMin, icon } = req.body;
        if (!category || !name || !durationMin) return fail(res, 'category, name, and durationMin are required');

        const id = uuidv4();
        await pool.query(
            'INSERT INTO services (id, category, name, duration_min, icon) VALUES (?,?,?,?,?)', [id, category, name, durationMin, icon || '🔧']
        );
        const [rows] = await pool.query('SELECT * FROM services WHERE id = ?', [id]);
        return ok(res, rows[0], 'Service created', 201);
    } catch (err) { next(err); }
};