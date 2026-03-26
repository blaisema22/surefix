const fs = require('fs');
const path = require('path');

const authContent = `const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/db');
const authMiddleware = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'surefix_secret_key_change_in_production';

router.post('/register', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async(req, res) => {
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
            'INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
            [name, emailInput, passwordHash, phone || null, validRole]
        );

        res.status(201).json({ success: true, message: 'Registration successful', userId: result.insertId });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/login', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
], async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const user = users[0];
        const isValidPassword = bcrypt.compareSync(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.user_id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
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
                isVerified: user.is_verified
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/me', authMiddleware, async(req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT user_id, name, email, phone, role, profile_image_url, is_verified, created_at FROM users WHERE user_id = ?',
            [req.user.userId]
        );
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const user = users[0];
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
                createdAt: user.created_at
            }
        });
    } catch (err) {
        console.error('Get me error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.put('/profile', authMiddleware, [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('phone').optional().trim(),
], async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, phone } = req.body;

    try {
        await pool.query(
            'UPDATE users SET name = ?, phone = ? WHERE user_id = ?',
            [name || req.user.name, phone || req.user.phone, req.user.userId]
        );
        res.json({ success: true, message: 'Profile updated' });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/change-password', authMiddleware, [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], async(req, res) => {
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

router.post('/forgot-password', [
    body('email').isEmail().withMessage('Valid email is required'),
], async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email } = req.body;

    try {
        const [users] = await pool.query('SELECT user_id FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.json({ success: true, message: 'If the email exists, a reset link will be sent' });
        }

        const resetToken = jwt.sign({ userId: users[0].user_id }, JWT_SECRET, { expiresIn: '1h' });
        const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);

        await pool.query(
            'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE user_id = ?',
            [resetToken, resetTokenExpires, users[0].user_id]
        );

        res.json({ success: true, message: 'If the email exists, a reset link will be sent' });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/reset-password', [
    body('token').notEmpty().withMessage('Token is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { token, newPassword } = req.body;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        const [users] = await pool.query(
            'SELECT user_id FROM users WHERE user_id = ? AND reset_token = ? AND reset_token_expires > NOW()',
            [decoded.userId, token]
        );

        if (users.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }

        const newHash = bcrypt.hashSync(newPassword, 10);
        await pool.query(
            'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE user_id = ?',
            [newHash, users[0].user_id]
        );

        res.json({ success: true, message: 'Password reset successful' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }
});

router.put('/profile/picture', authMiddleware, async(req, res) => {
    const { profileImageUrl } = req.body;

    try {
        await pool.query(
            'UPDATE users SET profile_image_url = ? WHERE user_id = ?',
            [profileImageUrl, req.user.userId]
        );
        res.json({ success: true, message: 'Profile picture updated', profileImageUrl });
    } catch (err) {
        console.error('Upload picture error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
`;

const authPath = path.join(__dirname, 'routes', 'auth.js');

try {
    fs.writeFileSync(authPath, authContent, 'utf8');
    console.log('Auth.js written successfully!');
    console.log('File size:', fs.statSync(authPath).size, 'bytes');
} catch (err) {
    console.error('Error writing file:', err);
}