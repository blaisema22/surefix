const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { pool } = require('../config/db');

// GET /api/simulator/sms - Fetch all simulated SMS for the current user
router.get('/sms', authMiddleware, async (req, res) => {
    try {
        const [users] = await pool.query('SELECT phone FROM users WHERE user_id = ?', [req.user.userId]);
        if (users.length === 0 || !users[0].phone) {
            return res.json({ success: true, messages: [] });
        }
        
        // Normalize phone number to E.164 exactly as sms.js does
        let p = String(users[0].phone).replace(/[^0-9+]/g, '');
        if (p.startsWith('0')) p = '+250' + p.substring(1);
        else if (p.startsWith('250')) p = '+' + p;
        else if (!p.startsWith('+')) p = '+' + p;

        const [messages] = await pool.query(
            'SELECT * FROM sms_simulator WHERE phone_number = ? ORDER BY created_at DESC LIMIT 50',
            [p]
        );
        res.json({ success: true, messages });
    } catch (error) {
        console.error('Simulator API Error:', error);
        res.status(500).json({ success: false, message: 'Server error retrieving simulated SMS' });
    }
});

module.exports = router;
