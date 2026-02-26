const db = require('../config/db');
const { ok, fail } = require('../utils/helpers');
const { v4: uuidv4 } = require('uuid');

// ── GET /api/notifications ───────────────────────────────────────────────────
exports.getNotifications = (req, res, next) => {
    try {
        const notifications = db.prepare(
            'SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC'
        ).all(req.user.id);
        return ok(res, notifications);
    } catch (err) { next(err); }
};

// ── POST /api/notifications ──────────────────────────────────────────────────
exports.createNotification = (req, res, next) => {
    try {
        const { userId, title, message, type } = req.body;
        const id = uuidv4();

        db.prepare(`
      INSERT INTO notifications (id, userId, title, message, type, isRead)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, userId, title, message, type || 'info', 0);

        const notification = db.prepare('SELECT * FROM notifications WHERE id = ?').get(id);
        return ok(res, notification, 'Notification created', 201);
    } catch (err) { next(err); }
};

// ── PATCH /api/notifications/:id ─────────────────────────────────────────────
exports.markAsRead = (req, res, next) => {
    try {
        const notification = db.prepare('SELECT * FROM notifications WHERE id = ? AND userId = ?')
            .get(req.params.id, req.user.id);
        if (!notification) return fail(res, 'Notification not found', 404);

        db.prepare('UPDATE notifications SET isRead = ? WHERE id = ?').run(1, req.params.id);
        const updated = db.prepare('SELECT * FROM notifications WHERE id = ?').get(req.params.id);
        return ok(res, updated);
    } catch (err) { next(err); }
};

// ── DELETE /api/notifications/:id ────────────────────────────────────────────
exports.deleteNotification = (req, res, next) => {
    try {
        const notification = db.prepare('SELECT * FROM notifications WHERE id = ? AND userId = ?')
            .get(req.params.id, req.user.id);
        if (!notification) return fail(res, 'Notification not found', 404);

        db.prepare('DELETE FROM notifications WHERE id = ?').run(req.params.id);
        return ok(res, null, 'Notification deleted');
    } catch (err) { next(err); }
};

const { ok } = require('../utils/helpers');

// ── GET /api/notifications ── (own notifications) ────────────────────────────
exports.listNotifications = async(req, res, next) => {
    try {
        const [rows] = await pool.query(
            `SELECT id, title, body, type, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 50`, [req.user.id]
        );
        const unreadCount = rows.filter(n => !n.is_read).length;
        return ok(res, { notifications: rows, unreadCount });
    } catch (err) { next(err); }
};

// ── PATCH /api/notifications/:id/read ────────────────────────────────────────
exports.markRead = async(req, res, next) => {
    try {
        await pool.query(
            'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]
        );
        return ok(res, null, 'Marked as read');
    } catch (err) { next(err); }
};

// ── PATCH /api/notifications/read-all ────────────────────────────────────────
exports.markAllRead = async(req, res, next) => {
    try {
        await pool.query(
            'UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.id]
        );
        return ok(res, null, 'All notifications marked as read');
    } catch (err) { next(err); }
};