const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// GET /api/reviews/centre/:id - Get all reviews for a centre
router.get('/centre/:id', async (req, res) => {
    try {
        const [reviews] = await pool.query(`
            SELECT r.*, u.name as customer_name, u.profile_image_url
            FROM reviews r
            JOIN users u ON r.user_id = u.user_id
            WHERE r.centre_id = ?
            ORDER BY r.created_at DESC
        `, [req.params.id]);

        res.json({ success: true, reviews });
    } catch (err) {
        console.error('Error fetching reviews:', err);
        res.status(500).json({ success: false, message: 'Server error fetching reviews' });
    }
});

// POST /api/reviews - Add a new review
router.post('/', authMiddleware, [
    body('appointment_id').isInt().withMessage('Appointment ID is required'),
    body('centre_id').isInt().withMessage('Centre ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').trim().optional(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { appointment_id, centre_id, rating, comment } = req.body;
    const user_id = req.user.userId;

    try {
        // 1. Verify that the appointment exists, belongs to the user, and is 'completed'
        const [appts] = await pool.query(`
            SELECT appointment_id, status FROM appointments 
            WHERE appointment_id = ? AND user_id = ? AND centre_id = ?
        `, [appointment_id, user_id, centre_id]);

        if (appts.length === 0) {
            return res.status(404).json({ success: false, message: 'Appointment not found or unauthorized.' });
        }

        if (appts[0].status !== 'completed') {
            return res.status(400).json({ success: false, message: 'You can only review completed repairs.' });
        }

        // 2. Check if already reviewed (appointment_id is unique in reviews)
        const [existing] = await pool.query('SELECT review_id FROM reviews WHERE appointment_id = ?', [appointment_id]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'You have already reviewed this appointment.' });
        }

        // 3. Insert review
        const [result] = await pool.query(
            'INSERT INTO reviews (appointment_id, user_id, centre_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
            [appointment_id, user_id, centre_id, rating, comment || null]
        );

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully!',
            reviewId: result.insertId
        });
    } catch (err) {
        console.error('Error submitting review:', err);
        res.status(500).json({ success: false, message: 'Server error submitting review' });
    }
});

module.exports = router;
