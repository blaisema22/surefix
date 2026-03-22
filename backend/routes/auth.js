const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/db');
const authMiddleware = require('../middleware/auth');
const emailService = require('../utils/email');

const JWT_SECRET = process.env.JWT_SECRET || 'surefix_secret_key_change_in_production';

// ─── REGISTER ───────────────────────────────────────────────
router.post('/register', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email: emailInput, password, phone, role } = req.body;

    try {
        const [existing] = await pool.query('SELECT user_id FROM users WHERE email = ?', [emailInput]);
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'Email already registered' });
        }

        const passwordHash = bcrypt.hashSync(password, 10);
        const validRole = ['customer', 'repairer'].includes(role) ? role : 'customer';

        const [result] = await pool.query(
            'INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)', [name, emailInput, passwordHash, phone || null, validRole]
        );

        res.status(201).json({ success: true, message: 'Registration successful', userId: result.insertId });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ─── LOGIN ─────────────────────────────────────────────────
router.post('/login', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            console.error('Login attempt failed: Email not found -', email);
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const user = users[0];
        const isValidPassword = bcrypt.compareSync(password, user.password_hash);
        if (!isValidPassword) {
            console.error('Login attempt failed: Wrong password for -', email);
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check if user is authorized
        if (!user.is_authorized) {
            console.error('Login attempt blocked: User not authorized -', email);
            return res.status(403).json({ success: false, message: 'Your account access has been revoked by an administrator.' });
        }

        // Check if repairer has a center
        let hasCentre = false;
        if (user.role === 'repairer') {
            const [centres] = await pool.query('SELECT centre_id FROM repair_centres WHERE owner_id = ?', [user.user_id]);
            hasCentre = centres.length > 0;
        }

        const token = jwt.sign({ userId: user.user_id, email: user.email, role: user.role },
            JWT_SECRET, { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                userId: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                profileImageUrl: user.profile_image_url,
                isVerified: user.is_verified,
                hasCentre
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ─── GET CURRENT USER ───────────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT user_id, name, email, phone, role, profile_image_url, is_verified, is_authorized, created_at FROM users WHERE user_id = ?', [req.user.userId]
        );
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const user = users[0];

        // Ensure user is still authorized
        if (!user.is_authorized) {
            return res.status(403).json({ success: false, message: 'Access revoked' });
        }

        // Check if repairer has a center
        let hasCentre = false;
        if (user.role === 'repairer') {
            const [centres] = await pool.query('SELECT centre_id FROM repair_centres WHERE owner_id = ?', [user.user_id]);
            hasCentre = centres.length > 0;
        }

        res.json({
            success: true,
            user: {
                userId: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                profileImageUrl: user.profile_image_url,
                isVerified: user.is_verified,
                createdAt: user.created_at,
                hasCentre
            }
        });
    } catch (err) {
        console.error('Get me error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ─── UPDATE PROFILE ─────────────────────────────────────────
router.put('/profile', authMiddleware, [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('phone').optional().trim(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, phone } = req.body;
    const { userId } = req.user;

    try {
        const [users] = await pool.query('SELECT name, phone FROM users WHERE user_id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const currentUser = users[0];

        await pool.query(
            'UPDATE users SET name = ?, phone = ? WHERE user_id = ?', [name || currentUser.name, phone !== undefined ? phone : currentUser.phone, userId]
        );
        res.json({ success: true, message: 'Profile updated' });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ─── CHANGE PASSWORD (PUT) ──────────────────────────────────
router.put('/password', authMiddleware, [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    try {
        const [users] = await pool.query('SELECT password_hash FROM users WHERE user_id = ?', [req.user.userId]);
        const user = users[0];

        if (!bcrypt.compareSync(currentPassword, user.password_hash)) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        const newHash = bcrypt.hashSync(newPassword, 10);
        await pool.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [newHash, req.user.userId]);

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (err) {
        console.error('Change password error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ─── DELETE ACCOUNT ─────────────────────────────────────────
router.delete('/profile', authMiddleware, async (req, res) => {
    try {
        await pool.query('DELETE FROM users WHERE user_id = ?', [req.user.userId]);
        res.json({ success: true, message: 'Account deleted successfully' });
    } catch (err) {
        console.error('Delete account error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ─── FORGOT PASSWORD ───────────────────────────────────────
router.post('/forgot-password', [
    body('email').isEmail().withMessage('Valid email is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email } = req.body;

    try {
        const [users] = await pool.query('SELECT user_id FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            // Don't reveal if email exists
            return res.json({ success: true, message: 'If the email exists, a reset link will be sent' });
        }

        const resetToken = jwt.sign({ userId: users[0].user_id }, JWT_SECRET, { expiresIn: '1h' });
        const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // FIX: removed misplaced res.status(500) call that was inside pool.query()
        await pool.query(
            'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE user_id = ?', [resetToken, resetTokenExpires, users[0].user_id]
        );

        // In production, send email with reset link
        emailService.sendPasswordResetEmail({ to: email, name: users[0].name, token: resetToken }).catch(console.error);
        res.json({ success: true, message: 'If the email exists, a reset link will be sent' });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ─── RESET PASSWORD ─────────────────────────────────────────
router.post('/reset-password', [
    body('token').notEmpty().withMessage('Token is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { token, newPassword } = req.body;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        const [users] = await pool.query(
            'SELECT user_id FROM users WHERE user_id = ? AND reset_token = ? AND reset_token_expires > NOW()', [decoded.userId, token]
        );

        if (users.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }

        const newHash = bcrypt.hashSync(newPassword, 10);
        await pool.query(
            'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE user_id = ?', [newHash, users[0].user_id]
        );

        res.json({ success: true, message: 'Password reset successful' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }
});

// ─── UPLOAD PROFILE PICTURE ─────────────────────────────────
router.put('/profile/picture', authMiddleware, async (req, res) => {
    // This would typically use multer for file upload
    // For now, we'll accept a URL
    const { profileImageUrl } = req.body;

    try {
        await pool.query(
            'UPDATE users SET profile_image_url = ? WHERE user_id = ?', [profileImageUrl, req.user.userId]
        );
        res.json({ success: true, message: 'Profile picture updated', profileImageUrl });
    } catch (err) {
        console.error('Upload picture error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


module.exports = router;