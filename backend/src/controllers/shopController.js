const db = require('../config/db');
const { ok, fail } = require('../utils/helpers');
const { v4: uuidv4 } = require('uuid');

// ── GET /api/shops ───────────────────────────────────────────────────────────
exports.listShops = (req, res, next) => {
    try {
        const shops = db.prepare(`
      SELECT s.id, s.shopName AS name, s.location, s.phone, s.email, s.rating, s.createdAt
      FROM shops s
      ORDER BY s.rating DESC
    `).all();
        return ok(res, shops);
    } catch (err) { next(err); }
};

// ── GET /api/shops/:id ───────────────────────────────────────────────────────
exports.getShop = (req, res, next) => {
    try {
        const shop = db.prepare('SELECT * FROM shops WHERE id = ?').get(req.params.id);
        if (!shop) return fail(res, 'Shop not found', 404);
        return ok(res, shop);
    } catch (err) { next(err); }
};

// ── POST /api/shops (create) ──────────────────────────────────────────────────
exports.createShop = (req, res, next) => {
    try {
        const { shopName, location, phone, email } = req.body;
        const id = uuidv4();

        db.prepare(`
      INSERT INTO shops (id, userId, shopName, location, phone, email, rating)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `).run(id, req.user.id, shopName, location, phone, email);

        const shop = db.prepare('SELECT * FROM shops WHERE id = ?').get(id);
        return ok(res, shop, 'Shop created', 201);
    } catch (err) { next(err); }
};

// ── PUT /api/shops/:id (update) ───────────────────────────────────────────────
exports.updateShop = (req, res, next) => {
    try {
        const shop = db.prepare('SELECT * FROM shops WHERE id = ?').get(req.params.id);
        if (!shop) return fail(res, 'Shop not found', 404);

        const { shopName, location, phone, email } = req.body;
        db.prepare(`
      UPDATE shops SET shopName = ?, location = ?, phone = ?, email = ?
      WHERE id = ?
    `).run(shopName || shop.shopName, location || shop.location, phone || shop.phone, email || shop.email, req.params.id);

        const updated = db.prepare('SELECT * FROM shops WHERE id = ?').get(req.params.id);
        return ok(res, updated);
    } catch (err) { next(err); }
};

// ── PUT /api/shops/profile ──────────────────────────────────────────────────
exports.updateProfile = (req, res, next) => {
    try {
        const shop = db.prepare('SELECT id FROM shops WHERE userId = ?').get(req.user.id);
        if (!shop) return fail(res, 'Shop not found', 404);

        const { shopName, location, phone, email } = req.body;
        db.prepare(`
      UPDATE shops SET shopName = ?, location = ?, phone = ?, email = ?
      WHERE id = ?
    `).run(shopName || shop.shopName, location || shop.location, phone || shop.phone, email || shop.email, shop.id);

        const updated = db.prepare('SELECT * FROM shops WHERE id = ?').get(shop.id);
        return ok(res, updated, 'Profile updated');
    } catch (err) { next(err); }
};

// ── GET /api/shops/:id/slots ─────────────────────────────────────────────────
exports.getAvailableSlots = (req, res, next) => {
    try {
        const { id } = req.params;
        const { date } = req.query;

        if (!date) {
            return fail(res, 'Date is required (format: YYYY-MM-DD)', 400);
        }

        const shop = db.prepare('SELECT openHours FROM shops WHERE id = ?').get(id);
        if (!shop) return fail(res, 'Shop not found', 404);

        // Generate time slots from 9 AM to 5 PM (simplified logic)
        const slots = [];
        const openHour = 9;
        const closeHour = 17;

        for (let hour = openHour; hour < closeHour; hour++) {
            const time = `${hour.toString().padStart(2, '0')}:00`;
            slots.push({
                time,
                available: true
            });
        }

        return ok(res, { date, slots });
    } catch (err) { next(err); }
};