const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const db = require('../config/db');
const { generateAccessToken, ok, fail } = require('../utils/helpers');

// ── POST /api/auth/register ──────────────────────────────────────────────────
exports.register = (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return fail(res, errors.array()[0].msg);

        const { role, email, password, phone, fullName } = req.body;

        // Check email not taken
        const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (exists) return fail(res, 'Email already registered', 409);

        const passwordHash = bcrypt.hashSync(password, 10);
        const userId = uuidv4();

        try {
            db.prepare(`
        INSERT INTO users (id, username, email, password, fullName, phone, role)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(userId, email.split('@')[0], email, passwordHash, fullName, phone || null, role || 'customer');

            const token = generateAccessToken(userId, role || 'customer');
            const user = _getPublicUser(userId, role || 'customer');
            return ok(res, { token, user }, 'Registration successful', 201);
        } catch (err) {
            throw err;
        }
    } catch (err) {
        next(err);
    }
};

// ── POST /api/auth/login ─────────────────────────────────────────────────────
exports.login = (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return fail(res, errors.array()[0].msg);

        const { email, password } = req.body;

        const user = db.prepare(
            'SELECT id, role, email, password FROM users WHERE email = ?'
        ).get(email);

        if (!user) return fail(res, 'Invalid email or password', 401);

        const match = bcrypt.compareSync(password, user.password);
        if (!match) return fail(res, 'Invalid email or password', 401);

        const token = generateAccessToken(user.id, user.role);
        const publicUser = _getPublicUser(user.id, user.role);
        return ok(res, { token, publicUser }, 'Login successful');
    } catch (err) {
        next(err);
    }
};

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
exports.me = (req, res, next) => {
    try {
        const user = _getPublicUser(req.user.id, req.user.role);
        return ok(res, user);
    } catch (err) {
        next(err);
    }
};

// ── POST /api/auth/logout ────────────────────────────────────────────────────
exports.logout = (req, res) => {
    return ok(res, null, 'Logged out successfully');
};

// ── Internal: build safe user object ─────────────────────────────────────────
function _getPublicUser(userId, role) {
    const user = db.prepare(
        'SELECT id, username, email, phone, fullName, role, createdAt FROM users WHERE id = ?'
    ).get(userId);

    if (!user) return null;

    return {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
        role: user.role,
        createdAt: user.createdAt
    };
}