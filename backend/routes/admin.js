const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');

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
            'SELECT user_id, name, email, role, phone, is_verified, is_authorized, created_at FROM users ORDER BY created_at DESC'
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

// @route   PATCH /api/admin/users/:id/authorize
// @desc    Ban or unban a user by toggling authorization
// @access  Admin
router.patch('/users/:id/authorize', auth, verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const { is_authorized } = req.body;

    if (typeof is_authorized !== 'boolean') {
        return res.status(400).json({ success: false, message: 'Invalid status provided.' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE users SET is_authorized = ? WHERE user_id = ?',
            [is_authorized, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        res.json({ success: true, message: `User ${is_authorized ? 'unbanned' : 'banned'} successfully.` });
    } catch (err) {
        console.error('Error updating authorization status:', err);
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

// @route   GET /api/admin/overview
// @desc    Get comprehensive overview data for dashboard
// @access  Admin
router.get('/overview', auth, verifyAdmin, async (req, res) => {
    try {
        // 1. Key Metrics (Totals)
        const [users] = await pool.query('SELECT COUNT(*) as count FROM users');
        const [centres] = await pool.query('SELECT COUNT(*) as count FROM repair_centres');
        const [appointments] = await pool.query('SELECT COUNT(*) as count FROM appointments');
        const [revenue] = await pool.query(`
            SELECT COUNT(*) as total 
            FROM appointments a 
            WHERE a.status = 'completed'
        `);

        // 2. Monthly Revenue & Appointments (Last 6 Months)
        const [monthlyStats] = await pool.query(`
            SELECT 
                DATE_FORMAT(a.appointment_date, '%Y-%m') as month,
                COUNT(*) as appointments,
                0 as revenue
            FROM appointments a
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
            overview: {
                total_users: users[0].count,
                total_centres: centres[0].count,
                total_appointments: appointments[0].count,
                total_revenue: revenue[0].total || 0,
                monthly_stats: monthlyStats,
                status_distribution: statusDist
            }
        });
    } catch (err) {
        console.error('Error fetching overview:', err);
        res.status(500).json({ success: false, message: 'Server error fetching overview.' });
    }
});

// @route   GET /api/admin/appointments
// @desc    Get all appointments for dashboard feed
// @access  Admin
router.get('/appointments', auth, verifyAdmin, async (req, res) => {
    try {
        const query = `
            SELECT 
                a.appointment_id,
                a.appointment_date,
                a.status,
                u.name as customer_name,
                rc.name as centre_name
            FROM appointments a
            LEFT JOIN users u ON a.user_id = u.user_id
            LEFT JOIN repair_centres rc ON a.centre_id = rc.centre_id
            ORDER BY a.created_at DESC
        `;
        const [appointments] = await pool.query(query);
        res.json({ success: true, appointments });
    } catch (err) {
        console.error('Error fetching admin appointments:', err);
        res.status(500).json({ success: false, message: 'Server error fetching appointments.' });
    }
});

// @route   POST /api/admin/users
// @desc    Manually create a new user account
// @access  Admin
router.post('/users', auth, verifyAdmin, async (req, res) => {
    const { name, email, password, role, phone, is_verified } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ success: false, message: 'Please provide name, email, password, and role.' });
    }

    if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    try {
        // Check if user exists
        const [existing] = await pool.query('SELECT user_id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'User with this email already exists.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Default verification to true if not specified, since admin is creating it
        const verifiedStatus = is_verified !== undefined ? (is_verified ? 1 : 0) : 1;

        const [result] = await pool.query(
            'INSERT INTO users (name, email, password_hash, role, phone, is_verified, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
            [name, email, hashedPassword, role, phone || null, verifiedStatus]
        );

        res.status(201).json({
            success: true,
            message: 'User created successfully.',
            user: { user_id: result.insertId, name, email, role, is_verified: !!verifiedStatus }
        });
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ success: false, message: 'Server error while creating user.' });
    }
});

module.exports = router;