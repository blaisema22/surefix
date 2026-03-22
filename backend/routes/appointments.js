const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { pool } = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const sharp = require('sharp');

// --- Multer Setup for Image Uploads ---
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

const generateBookingReference = () => {
    const prefix = 'SF';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${prefix}${result}`;
};

// POST /api/appointments - Book a new appointment
router.post('/',
    authMiddleware,
    upload.single('deviceImage'), [
    body('centre_id').notEmpty(),
    body('device_id').notEmpty(),
    body('appointment_date').isISO8601(),
    body('appointment_time').notEmpty(),
    body('issue_description').trim().notEmpty(),
],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation Errors:', errors.array());
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { userId } = req.user;
        let { centre_id, service_id, device_id, appointment_date, appointment_time, issue_description } = req.body;

        let issue_image_url = null;
        if (req.file) {
            const filename = `appointment-${Date.now()}.jpeg`;
            const filepath = path.join('uploads', filename);

            // Resize to max width 1024px, auto height, convert to JPEG 80% quality
            await sharp(req.file.buffer).resize({ width: 1024, withoutEnlargement: true }).toFormat('jpeg').jpeg({ quality: 80 }).toFile(filepath);
            issue_image_url = `uploads/${filename}`;
        }

        // Normalize service_id: if it's 'other', null, or empty string, set to null
        const normalized_service_id = (service_id === 'other' || !service_id || service_id === 'undefined') ? null : service_id;

        try {
            console.log('--- NEW BOOKING ATTEMPT ---');
            console.log('User ID:', userId);
            console.log('Payload:', { centre_id, normalized_service_id, device_id, appointment_date, appointment_time });

            const booking_reference = generateBookingReference();
            const status = 'pending';

            const [result] = await pool.query(
                `INSERT INTO appointments (
                    user_id, centre_id, device_id, service_id, 
                    appointment_date, appointment_time, status, 
                    issue_description, booking_reference, issue_image_url
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                userId,
                centre_id,
                device_id,
                normalized_service_id,
                appointment_date,
                appointment_time,
                status,
                issue_description,
                booking_reference,
                issue_image_url
            ]
            );

            // --- Notify Repair Centre Owner ---
            try {
                const [centreInfo] = await pool.query('SELECT owner_id, name FROM repair_centres WHERE centre_id = ?', [centre_id]);

                if (centreInfo.length > 0) {
                    const { owner_id, name } = centreInfo[0];
                    const notifTitle = 'New Booking Received';
                    const notifMessage = `New appointment (${booking_reference}) received for ${name}.`;

                    // 1. Save Notification to Database
                    const [notifRes] = await pool.query(
                        'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
                        [owner_id, notifTitle, notifMessage]
                    );

                    // 2. Emit Real-time Socket Event
                    if (req.io) {
                        req.io.to(`user_${owner_id}`).emit('receive_notification', {
                            notification_id: notifRes.insertId,
                            user_id: owner_id,
                            title: notifTitle,
                            message: notifMessage,
                            is_read: 0,
                            created_at: new Date()
                        });
                    }
                }
            } catch (notifErr) {
                console.error('Notification error:', notifErr);
                // Continue without failing the request
            }

            console.log('✅ Booking Successful! ID:', result.insertId);

            res.status(201).json({
                success: true,
                message: 'Appointment booked successfully.',
                appointment: { appointment_id: result.insertId, booking_reference }
            });

        } catch (err) {
            console.error('❌ SERVER BOOKING ERROR:', err.message);
            console.error(err.stack);
            res.status(500).json({
                success: false,
                message: 'Server error during booking.',
                error: err.message
            });
        }
    }
);

// GET /api/appointments - Get user's appointments
router.get('/', authMiddleware, async (req, res) => {
    try {
        const [appointments] = await pool.query(
            `SELECT a.*, c.name as centre_name, s.service_name, d.brand as device_brand, d.model as device_model,
                    (SELECT rating FROM reviews WHERE appointment_id = a.appointment_id) as my_rating
             FROM appointments a
             JOIN repair_centres c ON a.centre_id = c.centre_id
             LEFT JOIN services s ON a.service_id = s.service_id
             JOIN devices d ON a.device_id = d.device_id
             WHERE a.user_id = ?
             ORDER BY a.appointment_date DESC, a.appointment_time DESC`, [req.user.userId]
        );
        res.json({ success: true, appointments });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// PATCH /api/appointments/:id/cancel - Cancel appointment
router.patch('/:id/cancel', authMiddleware, async (req, res) => {
    try {
        // Get appointment info before cancellation
        const [appt] = await pool.query(
            `SELECT a.booking_reference, rc.owner_id as shop_owner_id, rc.name as centre_name
             FROM appointments a JOIN repair_centres rc ON a.centre_id = rc.centre_id
             WHERE a.appointment_id = ? AND a.user_id = ?`, [req.params.id, req.user.userId]
        );

        const [result] = await pool.query(
            "UPDATE appointments SET status = 'cancelled' WHERE appointment_id = ? AND user_id = ? AND status IN ('pending', 'confirmed')", [req.params.id, req.user.userId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Appointment not found or cannot be cancelled.' });
        }

        // --- Notify Shop Owner ---
        if (appt.length > 0) {
            try {
                const { booking_reference, shop_owner_id, centre_name } = appt[0];
                const notifTitle = 'Appointment Cancelled';
                const notifMessage = `Customer has cancelled appointment ${booking_reference} for ${centre_name}.`;

                const [notifRes] = await pool.query(
                    'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
                    [shop_owner_id, notifTitle, notifMessage]
                );

                if (req.io) {
                    req.io.to(`user_${shop_owner_id}`).emit('refresh_data');
                    req.io.to(`user_${shop_owner_id}`).emit('receive_notification', {
                        notification_id: notifRes.insertId,
                        user_id: shop_owner_id,
                        title: notifTitle,
                        message: notifMessage,
                        is_read: 0,
                        created_at: new Date()
                    });
                }
            } catch (notifErr) {
                console.error('Cancellation notification error:', notifErr);
            }
        }

        res.json({ success: true, message: 'Appointment cancelled.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// PATCH /api/appointments/:id/status - Shop update status
router.patch('/:id/status', authMiddleware, upload.single('completionImage'), [
    body('status').isIn(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    if (req.user.role !== 'repairer') {
        return res.status(403).json({ success: false, message: 'Repairer access only' });
    }

    const { id } = req.params;
    const { status } = req.body;

    try {
        // Check shop owns centre and get info for notification
        const [appt] = await pool.query(
            `SELECT a.user_id as customer_id, a.centre_id, rc.owner_id as shop_owner_id, a.booking_reference, rc.name as centre_name
             FROM appointments a JOIN repair_centres rc ON a.centre_id = rc.centre_id
             WHERE a.appointment_id = ?`, [id]
        );
        if (appt.length === 0 || appt[0].shop_owner_id !== req.user.userId) {
            return res.status(404).json({ success: false, message: 'Appointment not found or unauthorized' });
        }

        let completion_image_url = null;
        if (req.file) {
            const filename = `completion-${Date.now()}.jpeg`;
            const filepath = path.join('uploads', filename);
            await sharp(req.file.buffer).resize({ width: 1024, withoutEnlargement: true }).toFormat('jpeg').jpeg({ quality: 80 }).toFile(filepath);
            completion_image_url = `uploads/${filename}`;
        }

        let query = 'UPDATE appointments SET status = ?';
        const params = [status];

        if (completion_image_url) {
            query += ', completion_image_url = ?';
            params.push(completion_image_url);
        }

        query += ' WHERE appointment_id = ?';
        params.push(id);

        const [result] = await pool.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'No changes made' });
        }

        // --- Notify Customer ---
        try {
            const { customer_id, booking_reference, centre_name } = appt[0];
            const notifTitle = 'Appointment Update';
            const statusText = status.toUpperCase().replace('_', ' ');
            const notifMessage = `Your appointment (${booking_reference}) at ${centre_name} is now ${statusText}.`;

            // 1. Save Notification to Database
            const [notifRes] = await pool.query(
                'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
                [customer_id, notifTitle, notifMessage]
            );

            // 2. Emit Real-time Socket Event
            if (req.io) {
                // Emit both refresh_data and receive_notification
                req.io.to(`user_${customer_id}`).emit('refresh_data');
                req.io.to(`user_${customer_id}`).emit('receive_notification', {
                    notification_id: notifRes.insertId,
                    user_id: customer_id,
                    title: notifTitle,
                    message: notifMessage,
                    is_read: 0,
                    created_at: new Date()
                });
            }
        } catch (notifErr) {
            console.error('Customer Notification error:', notifErr);
            // Continue without failing the request
        }

        res.json({ success: true, message: `Status updated to ${status}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// POST /api/appointments/:id/rate - Rate a completed appointment
router.post('/:id/rate', authMiddleware, [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().trim().isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const appointmentId = req.params.id;
    const { rating, comment } = req.body;
    const userId = req.user.userId;

    try {
        // 1. Verify appointment eligibility
        const [appt] = await pool.query(
            "SELECT centre_id, status FROM appointments WHERE appointment_id = ? AND user_id = ?",
            [appointmentId, userId]
        );

        if (appt.length === 0) return res.status(404).json({ success: false, message: 'Appointment not found' });
        if (appt[0].status !== 'completed') return res.status(400).json({ success: false, message: 'Only completed appointments can be rated' });

        // 2. Check if already reviewed
        const [existing] = await pool.query("SELECT review_id FROM reviews WHERE appointment_id = ?", [appointmentId]);
        if (existing.length > 0) return res.status(400).json({ success: false, message: 'You have already rated this appointment' });

        // 3. Insert Review
        await pool.query(
            "INSERT INTO reviews (appointment_id, centre_id, user_id, rating, comment) VALUES (?, ?, ?, ?, ?)",
            [appointmentId, appt[0].centre_id, userId, rating, comment || '']
        );

        res.status(201).json({ success: true, message: 'Review submitted successfully' });
    } catch (err) {
        console.error('Rating error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;