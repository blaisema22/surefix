const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { ok, fail } = require('../utils/helpers');

// ── GET /api/profile ──────────────────────────────────────────────────────────
exports.getProfile = (req, res, next) => {
    try {
        const user = db.prepare('SELECT id, username, email, phone, fullName, role, createdAt FROM users WHERE id = ?')
            .get(req.user.id);
        if (!user) return fail(res, 'User not found', 404);
        return ok(res, user);
    } catch (err) { next(err); }
};

// ── PUT /api/profile ──────────────────────────────────────────────────────────
exports.updateProfile = (req, res, next) => {
    try {
        const { fullName, phone } = req.body;

        db.prepare('UPDATE users SET fullName = ?, phone = ? WHERE id = ?')
            .run(fullName || req.user.fullName, phone || req.user.phone, req.user.id);

        const updated = db.prepare('SELECT id, username, email, phone, fullName, role, createdAt FROM users WHERE id = ?')
            .get(req.user.id);
        return ok(res, updated, 'Profile updated');
    } catch (err) { next(err); }
};

// ── PUT /api/profile/password ──────────────────────────────────────────────────
exports.updatePassword = (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = db.prepare('SELECT password FROM users WHERE id = ?').get(req.user.id);
        if (!user) return fail(res, 'User not found', 404);

        if (!bcrypt.compareSync(currentPassword, user.password)) {
            return fail(res, 'Current password is incorrect', 401);
        }

        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, req.user.id);

        return ok(res, null, 'Password updated');
    } catch (err) { next(err); }
};

// Compatibility aliases
exports.updateCustomerProfile = exports.updateProfile;
exports.updateShopProfile = exports.updateProfile;
exports.getShopProfile = exports.getProfile;
exports.getCustomerProfile = exports.getProfile;

try {
    const { firstName, lastName, phone, location, prefEmail, prefSms, prefMarketing } = req.body;

    if (phone) {
        await pool.query('UPDATE users SET phone = ? WHERE id = ?', [phone, req.user.id]);
    }

    await pool.query(
        `UPDATE customer_profiles SET
         first_name       = COALESCE(?, first_name),
         last_name        = COALESCE(?, last_name),
         location         = COALESCE(?, location),
         pref_email       = COALESCE(?, pref_email),
         pref_sms         = COALESCE(?, pref_sms),
         pref_marketing   = COALESCE(?, pref_marketing)
       WHERE user_id = ?`, [firstName, lastName, location,
            prefEmail != null ? (prefEmail ? 1 : 0) : null,
            prefSms != null ? (prefSms ? 1 : 0) : null,
            prefMarketing != null ? (prefMarketing ? 1 : 0) : null,
            req.user.id
        ]
    );

    const [rows] = await pool.query(
        `SELECT u.id, u.email, u.phone, u.avatar, cp.*
       FROM users u
       JOIN customer_profiles cp ON cp.user_id = u.id
       WHERE u.id = ?`, [req.user.id]
    );
    return ok(res, rows[0], 'Profile updated');
} catch (err) { next(err); }
};

// ── PUT /api/profile/shop ─────────────────────────────────────────────────────
exports.updateShopProfile = async(req, res, next) => {
    try {
        const { phone, companyName, ownerName, address, tinNumber, openHours } = req.body;

        if (phone) {
            await pool.query('UPDATE users SET phone = ? WHERE id = ?', [phone, req.user.id]);
        }

        await pool.query(
            `UPDATE shop_profiles SET
         company_name  = COALESCE(?, company_name),
         owner_name    = COALESCE(?, owner_name),
         address       = COALESCE(?, address),
         tin_number    = COALESCE(?, tin_number),
         open_hours    = COALESCE(?, open_hours)
       WHERE user_id = ?`, [companyName, ownerName, address, tinNumber, openHours, req.user.id]
        );

        const [rows] = await pool.query(
            `SELECT u.id, u.email, u.phone, u.avatar, sp.*
       FROM users u
       JOIN shop_profiles sp ON sp.user_id = u.id
       WHERE u.id = ?`, [req.user.id]
        );
        return ok(res, rows[0], 'Shop profile updated');
    } catch (err) { next(err); }
};

// ── PUT /api/profile/password ─────────────────────────────────────────────────
exports.changePassword = async(req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return fail(res, 'currentPassword and newPassword are required');
        }
        if (newPassword.length < 6) {
            return fail(res, 'New password must be at least 6 characters');
        }

        const [rows] = await pool.query(
            'SELECT password_hash FROM users WHERE id = ?', [req.user.id]
        );
        const match = await bcrypt.compare(currentPassword, rows[0].password_hash);
        if (!match) return fail(res, 'Current password is incorrect', 401);

        const newHash = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);
        return ok(res, null, 'Password changed successfully');
    } catch (err) { next(err); }
};

// ── GET /api/profile/customers ── (shop owner: list their customers) ──────────
exports.listShopCustomers = async(req, res, next) => {
    try {
        const [sp] = await pool.query(
            'SELECT id FROM shop_profiles WHERE user_id = ?', [req.user.id]
        );
        if (!sp.length) return fail(res, 'Shop not found', 404);

        const [rows] = await pool.query(
            `SELECT
         u.id, CONCAT(cp.first_name,' ',cp.last_name) AS name,
         u.email, u.phone,
         COUNT(DISTINCT d.id)  AS devices,
         COUNT(a.id)           AS total_repairs,
         MIN(a.created_at)     AS joined_at,
         MAX(a.appointment_date) AS last_visit
       FROM appointments a
       JOIN users u              ON u.id  = a.customer_id
       JOIN customer_profiles cp ON cp.user_id = a.customer_id
       LEFT JOIN devices d       ON d.customer_id = u.id
       WHERE a.shop_id = ?
         AND a.status  = 'completed'
       GROUP BY u.id, cp.first_name, cp.last_name, u.email, u.phone
       ORDER BY last_visit DESC`, [sp[0].id]
        );
        return ok(res, rows);
    } catch (err) { next(err); }
};