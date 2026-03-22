const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const auth = require('../middleware/auth');

// Middleware to verify admin privileges
const verifyAdmin = (req, res, next) => {
    // auth middleware should populate req.user with decoded token payload
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied: Administrator privileges required.' });
    }
    next();
};

// @route   GET /api/admin/centres
// @desc    Get all repair centres with owner details
// @access  Admin
router.get('/centres', auth, verifyAdmin, async (req, res) => {
    try {
        // Join with users table to get owner details
        const query = `
            SELECT 
                rc.*,
                u.name AS owner_name,
                u.email AS owner_email
            FROM repair_centres rc
            LEFT JOIN users u ON rc.owner_id = u.user_id
            ORDER BY rc.created_at DESC
        `;

        const [centres] = await pool.query(query);
        res.json({ success: true, centres });
    } catch (err) {
        console.error('Error fetching admin centres:', err);
        res.status(500).json({ success: false, message: 'Server error while fetching centres.' });
    }
});

// @route   PATCH /api/admin/centres/:id/status
// @desc    Approve or deactivate a repair centre
// @access  Admin
router.patch('/centres/:id/status', auth, verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
        return res.status(400).json({ success: false, message: 'Invalid status provided.' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE repair_centres SET is_active = ? WHERE centre_id = ?',
            [is_active, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Repair centre not found.' });
        }

        res.json({ success: true, message: `Centre ${is_active ? 'approved' : 'deactivated'} successfully.` });
    } catch (err) {
        console.error('Error updating centre status:', err);
        res.status(500).json({ success: false, message: 'Server error while updating status.' });
    }
});

// @route   GET /api/admin/users
// @desc    Get all users (customers and repairers)
// @access  Admin
router.get('/users', auth, verifyAdmin, async (req, res) => {
    try {
        // Fetch users excluding sensitive password data
        const [users] = await pool.query(
            'SELECT user_id, name, email, role, phone, is_verified, created_at FROM users ORDER BY created_at DESC'
        );
        res.json({ success: true, users });
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ success: false, message: 'Server error while fetching users.' });
    }
});

// @route   PATCH /api/admin/users/:id/verify
// @desc    Toggle user verification status (useful for vetting repairers)
// @access  Admin
router.patch('/users/:id/verify', auth, verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const { is_verified } = req.body;

    if (typeof is_verified !== 'boolean') {
        return res.status(400).json({ success: false, message: 'Invalid status provided.' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE users SET is_verified = ? WHERE user_id = ?',
            [is_verified, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        res.json({ success: true, message: `User ${is_verified ? 'verified' : 'unverified'} successfully.` });
    } catch (err) {
        console.error('Error updating verification status:', err);
        res.status(500).json({ success: false, message: 'Server error while updating user.' });
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user account
// @access  Admin
router.delete('/users/:id', auth, verifyAdmin, async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM users WHERE user_id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        res.json({ success: true, message: 'User deleted successfully.' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ success: false, message: 'Server error while deleting user.' });
    }
});

// @route   GET /api/admin/analytics
// @desc    Get comprehensive analytics data for dashboard
// @access  Admin
router.get('/analytics', auth, verifyAdmin, async (req, res) => {
    try {
        // 1. Key Metrics (Totals)
        const [users] = await pool.query('SELECT COUNT(*) as count FROM users');
        const [centres] = await pool.query('SELECT COUNT(*) as count FROM repair_centres');
        const [appointments] = await pool.query('SELECT COUNT(*) as count FROM appointments');
        const [revenue] = await pool.query(`
            SELECT SUM(s.estimated_price_min) as total 
            FROM appointments a 
            JOIN services s ON a.service_id = s.service_id 
            WHERE a.status = 'completed'
        `);

        // 2. Monthly Revenue & Appointments (Last 6 Months)
        const [monthlyStats] = await pool.query(`
            SELECT 
                DATE_FORMAT(a.appointment_date, '%Y-%m') as month,
                COUNT(*) as appointments,
                SUM(CASE WHEN a.status = 'completed' THEN s.estimated_price_min ELSE 0 END) as revenue
            FROM appointments a
            LEFT JOIN services s ON a.service_id = s.service_id
            WHERE a.appointment_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY month
            ORDER BY month ASC
        `);

        // 3. Status Distribution
        const [statusDist] = await pool.query(`
            SELECT status, COUNT(*) as count 
            FROM appointments 
            GROUP BY status
        `);

        res.json({
            success: true,
            analytics: {
                total_users: users[0].count,
                total_centres: centres[0].count,
                total_appointments: appointments[0].count,
                total_revenue: revenue[0].total || 0,
                monthly_stats: monthlyStats,
                status_distribution: statusDist
            }
        });
    } catch (err) {
        console.error('Error fetching analytics:', err);
        res.status(500).json({ success: false, message: 'Server error fetching analytics.' });
    }
});

module.exports = router;