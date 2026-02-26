const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const db = require('../config/db');
const { ok, fail } = require('../utils/helpers');
const { v4: uuidv4 } = require('uuid');

// ── GET /api/reviews ──────────────────────────────────────────────────────────
exports.getReviews = (req, res, next) => {
    try {
        const reviews = db.prepare('SELECT * FROM reviews ORDER BY createdAt DESC').all();
        return ok(res, reviews);
    } catch (err) { next(err); }
};

// ── POST /api/reviews ─────────────────────────────────────────────────────────
exports.createReview = (req, res, next) => {
    try {
        const { shopId, rating, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return fail(res, 'Rating must be between 1 and 5');
        }

        const id = uuidv4();
        db.prepare(`
      INSERT INTO reviews (id, customerId, shopId, rating, comment)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, req.user.id, shopId, rating, comment || null);

        const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(id);
        return ok(res, review, 'Review created', 201);
    } catch (err) { next(err); }
};

// ── GET /api/reviews/:shopId ──────────────────────────────────────────────────
exports.getShopReviews = (req, res, next) => {
    try {
        const reviews = db.prepare(
            'SELECT * FROM reviews WHERE shopId = ? ORDER BY createdAt DESC'
        ).all(req.params.shopId);
        return ok(res, reviews);
    } catch (err) { next(err); }
};

const { ok, fail } = require('../utils/helpers');

// ── GET /api/reviews/shop/:shopId ────────────────────────────────────────────
exports.listShopReviews = async(req, res, next) => {
    try {
        const [rows] = await pool.query(
            `SELECT r.id, r.rating, r.comment, r.created_at,
              CONCAT(cp.first_name,' ',cp.last_name) AS customer_name,
              u.avatar,
              a.appointment_date, s.name AS service_name
       FROM reviews r
       JOIN users u             ON u.id = r.customer_id
       JOIN customer_profiles cp ON cp.user_id = r.customer_id
       JOIN appointments a      ON a.id = r.appointment_id
       JOIN services s          ON s.id = a.service_id
       WHERE r.shop_id = ?
       ORDER BY r.created_at DESC`, [req.params.shopId]
        );
        return ok(res, rows);
    } catch (err) { next(err); }
};

// ── POST /api/reviews ── (customer submits review for completed appointment) ──
exports.createReview = async(req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return fail(res, errors.array()[0].msg);

        const { appointmentId, rating, comment } = req.body;

        // Appointment must be completed and belong to this customer
        const [aptRows] = await pool.query(
            'SELECT id, shop_id, status FROM appointments WHERE id = ? AND customer_id = ?', [appointmentId, req.user.id]
        );
        if (!aptRows.length) return fail(res, 'Appointment not found', 404);
        if (aptRows[0].status !== 'completed') return fail(res, 'Can only review completed appointments');

        // Prevent duplicate review
        const [dupCheck] = await pool.query(
            'SELECT id FROM reviews WHERE appointment_id = ?', [appointmentId]
        );
        if (dupCheck.length) return fail(res, 'You already reviewed this appointment', 409);

        const shopId = aptRows[0].shop_id;
        const id = uuidv4();

        await pool.query(
            'INSERT INTO reviews (id, appointment_id, customer_id, shop_id, rating, comment) VALUES (?,?,?,?,?,?)', [id, appointmentId, req.user.id, shopId, rating, comment || null]
        );

        // Recalculate shop average rating
        await pool.query(
            `UPDATE shop_profiles sp SET
         rating       = (SELECT ROUND(AVG(r.rating),1) FROM reviews r WHERE r.shop_id = sp.id),
         review_count = (SELECT COUNT(*) FROM reviews r WHERE r.shop_id = sp.id)
       WHERE sp.id = ?`, [shopId]
        );

        const [rows] = await pool.query('SELECT * FROM reviews WHERE id = ?', [id]);
        return ok(res, rows[0], 'Review submitted', 201);
    } catch (err) { next(err); }
};