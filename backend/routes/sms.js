const router = require('express').Router();
const { pool } = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { normalizePhone } = require('../utils/sms');

// GET /api/sms/simulator — Fetch SMS messages for the logged-in user's phone number
router.get('/simulator', authMiddleware, async (req, res) => {
    try {
        const [users] = await pool.query('SELECT phone FROM users WHERE user_id = ?', [req.user.userId]);
        if (!users.length || !users[0].phone) {
            return res.json({ success: true, messages: [] });
        }

        const phone = normalizePhone(users[0].phone);

        const [messages] = await pool.query(
            `SELECT * FROM sms_simulator WHERE phone_number = ? ORDER BY created_at DESC LIMIT 50`,
            [phone]
        );
        res.json({ success: true, messages });
    } catch (err) {
        console.error('[SMS Route] Error:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// DELETE /api/sms/simulator — Clear all messages for the logged-in user's phone
router.delete('/simulator', authMiddleware, async (req, res) => {
    try {
        const [users] = await pool.query('SELECT phone FROM users WHERE user_id = ?', [req.user.userId]);
        if (!users.length || !users[0].phone) return res.json({ success: true });

        const phone = normalizePhone(users[0].phone);
        await pool.query('DELETE FROM sms_simulator WHERE phone_number = ?', [phone]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
