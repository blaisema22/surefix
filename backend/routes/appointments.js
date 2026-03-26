const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { pool } = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const sharp = require('sharp');
const { sendSMS } = require('../utils/sms');
const { shortenUrl } = require('../utils/shortener');
const smsService = require('../services/appointmentSMS.service');

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
        const { phone } = req.body;

        try {
            console.log('--- NEW BOOKING ATTEMPT ---');
            console.log('User ID:', userId);
            console.log('Payload:', { centre_id, normalized_service_id, device_id, appointment_date, appointment_time, phone });

            // --- Sync Phone Number to Profile if missing ---
            if (phone) {
                const [currentUser] = await pool.query('SELECT phone FROM users WHERE user_id = ?', [userId]);
                if (currentUser.length > 0 && (!currentUser[0].phone || currentUser[0].phone.length < 5)) {
                    await pool.query('UPDATE users SET phone = ? WHERE user_id = ?', [phone, userId]);
                    console.log(`[Sync] Updated customer ${userId} phone to: ${phone}`);
                }
            }

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
                // Get owner ID and their Phone Number from the users table
                const [centreInfo] = await pool.query(
                    `SELECT rc.owner_id, rc.name, u.phone as owner_phone 
                     FROM repair_centres rc 
                     JOIN users u ON rc.owner_id = u.user_id 
                     WHERE rc.centre_id = ?`, [centre_id]);

                if (centreInfo.length > 0) {
                    const { owner_id, name, owner_phone } = centreInfo[0];
                    const notifTitle = 'New Booking Received';
                    const notifMessage = `SureFix Alert: You have a new repair request [Ref: ${booking_reference}]. Please log in to review.`;

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

                    // 3. Send SMS to Shop Owner
                    if (owner_phone) {
                        const link = await shortenUrl(`${process.env.FRONTEND_URL}/dashboard`);
                        await sendSMS(owner_phone, `SureFix: ${notifMessage} View: ${link}`);
                    }
                }
            } catch (notifErr) {
                console.error('Notification error:', notifErr);
                // Continue without failing the request
            }

            // --- Notify Customer + Shop via rich SMS templates ---
            try {
                const [customerInfo] = await pool.query(
                    `SELECT u.phone, u.name, rc.name as centre_name, u2.phone as owner_phone
                     FROM users u
                     JOIN appointments a ON a.user_id = u.user_id
                     JOIN repair_centres rc ON a.centre_id = rc.centre_id
                     JOIN users u2 ON rc.owner_id = u2.user_id
                     WHERE a.appointment_id = ?`, [result.insertId]);

                if (customerInfo.length > 0) {
                    const info = customerInfo[0];
                    const apptData = {
                        customer_name: info.name,
                        centre_name: info.centre_name,
                        booking_reference,
                        appointment_date,
                        appointment_time,
                        service_name: req.body.service_name || null,
                        device_brand: null, device_model: null
                    };
                    await smsService.onBooked(apptData, info.phone, info.owner_phone);
                }
            } catch (custSmsErr) {
                console.error('Customer SMS error:', custSmsErr);
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

// GET /api/appointments/shop - Get appointments for the shop owner's centre
router.get('/shop', authMiddleware, async (req, res) => {
    if (req.user.role !== 'repairer') {
        return res.status(403).json({ success: false, message: 'Access denied. Repairers only.' });
    }
    try {
        const [appointments] = await pool.query(
            `SELECT a.*, 
                    u.name as customer_name, u.phone as customer_phone,
                    d.brand as device_brand, d.model as device_model,
                    s.service_name,
                    rc.name as centre_name
             FROM appointments a
             JOIN repair_centres rc ON a.centre_id = rc.centre_id
             JOIN users u ON a.user_id = u.user_id
             JOIN devices d ON a.device_id = d.device_id
             LEFT JOIN services s ON a.service_id = s.service_id
             WHERE rc.owner_id = ?
             ORDER BY a.appointment_id DESC LIMIT 10`,
            [req.user.userId]
        );
        res.json({ success: true, appointments });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// GET /api/appointments/:id - Get single appointment details
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const [appt] = await pool.query(
            `SELECT a.*, 
                    c.name as centre_name, c.address as centre_address, c.phone as centre_phone, c.latitude, c.longitude,
                    s.service_name, 
                    d.brand as device_brand, d.model as device_model, d.device_type
             FROM appointments a
             JOIN repair_centres c ON a.centre_id = c.centre_id
             LEFT JOIN services s ON a.service_id = s.service_id
             JOIN devices d ON a.device_id = d.device_id
             WHERE a.appointment_id = ? AND a.user_id = ?`,
            [req.params.id, req.user.userId]
        );

        if (appt.length === 0) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        res.json({ success: true, appointment: appt[0] });
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
            `SELECT a.booking_reference, rc.owner_id as shop_owner_id, rc.name as centre_name, u.phone as owner_phone
             FROM appointments a
             JOIN repair_centres rc ON a.centre_id = rc.centre_id
             JOIN users u ON rc.owner_id = u.user_id
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
                const { booking_reference, shop_owner_id, owner_phone } = appt[0];
                const notifTitle = 'Appointment Cancelled';
                const notifMessage = `SureFix Alert: The customer has cancelled their repair request [Ref: ${booking_reference}].`;

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

                // Notify Shop Owner via SMS with rich template
                if (appt.length > 0) {
                    const { booking_reference, centre_name, owner_phone } = appt[0];
                    const [custData] = await pool.query(
                        `SELECT u.name, u.phone, a.appointment_date, a.appointment_time
                         FROM appointments a JOIN users u ON a.user_id = u.user_id
                         WHERE a.appointment_id = ?`, [req.params.id]);
                    if (custData.length > 0) {
                        await smsService.onCancelled({
                            customer_name: custData[0].name,
                            centre_name,
                            booking_reference,
                            appointment_date: custData[0].appointment_date,
                            appointment_time: custData[0].appointment_time,
                        }, custData[0].phone, owner_phone);
                    }
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
            `SELECT a.user_id as customer_id, a.centre_id, rc.owner_id as shop_owner_id, a.booking_reference, rc.name as centre_name, u.phone as customer_phone
             FROM appointments a
             JOIN repair_centres rc ON a.centre_id = rc.centre_id
             JOIN users u ON a.user_id = u.user_id
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
            const { customer_id, booking_reference, centre_name, customer_phone } = appt[0];
            const notifTitle = 'Appointment Update';
            let notifMessage = '';
            
            switch(status) {
                case 'confirmed':
                    notifMessage = `Great news! Your repair request [Ref: ${booking_reference}] at ${centre_name} has been CONFIRMED.`;
                    break;
                case 'in_progress':
                    notifMessage = `Update: Your device [Ref: ${booking_reference}] is now IN PROGRESS at ${centre_name}!`;
                    break;
                case 'completed':
                    notifMessage = `Success! Your repair [Ref: ${booking_reference}] is COMPLETED. You can now pick up your device at ${centre_name}.`;
                    break;
                case 'cancelled':
                    notifMessage = `Your repair [Ref: ${booking_reference}] at ${centre_name} has been CANCELLED.`;
                    break;
                default:
                    const statusText = status.toUpperCase().replace('_', ' ');
                    notifMessage = `Your appointment [Ref: ${booking_reference}] at ${centre_name} is now ${statusText}.`;
            }

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

            // 3. Send rich SMS to Customer based on status
            if (customer_phone) {
                const apptData = { customer_name: '', centre_name, booking_reference,
                    appointment_date: '', appointment_time: '' };
                const [fullAppt] = await pool.query(
                    `SELECT u.name as customer_name, a.appointment_date, a.appointment_time
                     FROM appointments a JOIN users u ON a.user_id = u.user_id
                     WHERE a.appointment_id = ?`, [id]);
                if (fullAppt.length > 0) Object.assign(apptData, fullAppt[0]);

                switch (status) {
                    case 'confirmed':    await smsService.onConfirmed(apptData, customer_phone); break;
                    case 'in_progress': await smsService.onStarted(apptData, customer_phone);   break;
                    case 'completed':   await smsService.onCompleted(apptData, customer_phone);  break;
                    case 'cancelled':   await smsService.onCancelled(apptData, customer_phone);  break;
                }
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

// GET /api/appointments/reference/:ref - Get appointment by reference (Repairer only)
router.get('/reference/:ref', authMiddleware, async (req, res) => {
    // 1. Verify Role
    if (req.user.role !== 'repairer') {
        return res.status(403).json({ success: false, message: 'Access denied. Repairers only.' });
    }

    const { ref } = req.params;

    try {
        // 2. Find appointment AND ensure it belongs to a centre owned by this user
        const [appt] = await pool.query(
            `SELECT a.*, 
                    u.name as customer_name, u.phone as customer_phone, u.email as customer_email,
                    d.brand, d.model, 
                    s.service_name,
                    rc.name as centre_name
             FROM appointments a
             JOIN repair_centres rc ON a.centre_id = rc.centre_id
             JOIN users u ON a.user_id = u.user_id
             JOIN devices d ON a.device_id = d.device_id
             LEFT JOIN services s ON a.service_id = s.service_id
             WHERE a.booking_reference = ? AND rc.owner_id = ?`,
            [ref, req.user.userId]
        );

        if (appt.length === 0) {
            return res.status(404).json({ success: false, message: 'Appointment not found or does not belong to your centre.' });
        }

        res.json({ success: true, appointment: appt[0] });
    } catch (err) {
        console.error('QR Lookup Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;