const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const authMiddleware = require('../middleware/auth');

// POST /api/notifications - Create a notification and emit it in real-time
router.post('/', authMiddleware, async (req, res) => {
    const { target_user_id, title, message } = req.body;

    // Security: Only allow admins to manually trigger notifications via API
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    if (!target_user_id || !title || !message) {
        return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    try {
        // 1. Save to Database
        const [result] = await pool.query(
            'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
            [target_user_id, title, message]
        );

        const newNotification = {
            notification_id: result.insertId,
            user_id: target_user_id,
            title,
            message,
            is_read: 0,
            created_at: new Date()
        };

        // 2. Emit Real-time Event to specific user room
        if (req.io) {
            req.io.to(`user_${target_user_id}`).emit('receive_notification', newNotification);
        }

        res.status(201).json({ success: true, notification: newNotification });
    } catch (err) {
        console.error('Error creating notification:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/notifications - Get all notifications for the current user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        // Get total count for pagination metadata
        const [countResult] = await pool.query(
            'SELECT COUNT(*) as total FROM notifications WHERE user_id = ?',
            [req.user.userId]
        );
        const total = countResult[0].total;

        // Get unread count for badge
        const [unreadResult] = await pool.query(
            'SELECT COUNT(*) as unread FROM notifications WHERE user_id = ? AND is_read = 0',
            [req.user.userId]
        );
        const unreadCount = unreadResult[0].unread;

        const [rows] = await pool.query(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
            [req.user.userId, limit, offset]
        );

        res.json({
            success: true,
            notifications: rows,
            unread_count: unreadCount,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error('Error fetching notifications:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// PATCH /api/notifications/:id/read - Mark a single notification as read
router.patch('/:id/read', authMiddleware, async (req, res) => {
    const notificationId = req.params.id;

    try {
        // 1. Verify existence and ownership
        const [exists] = await pool.query(
            'SELECT notification_id FROM notifications WHERE notification_id = ? AND user_id = ?',
            [notificationId, req.user.userId]
        );

        if (exists.length === 0) {
            return res.status(404).json({ success: false, message: 'Notification not found or unauthorized' });
        }

        // 2. Update status
        await pool.query('UPDATE notifications SET is_read = 1 WHERE notification_id = ?', [notificationId]);

        res.json({ success: true, message: 'Marked as read' });
    } catch (err) {
        console.error('Error updating notification:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// PATCH /api/notifications/read-all - Mark all notifications as read
router.patch('/read-all', authMiddleware, async (req, res) => {
    try {
        await pool.query(
            'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
            [req.user.userId]
        );
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (err) {
        console.error('Error marking all read:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// DELETE /api/notifications/clear-all - Delete all notifications for the current user
router.delete('/clear-all', authMiddleware, async (req, res) => {
    try {
        await pool.query('DELETE FROM notifications WHERE user_id = ?', [req.user.userId]);
        res.json({ success: true, message: 'All notifications deleted' });
    } catch (err) {
        console.error('Error clearing notifications:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;