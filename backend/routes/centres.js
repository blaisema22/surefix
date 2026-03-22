const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { pool } = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const sharp = require('sharp');

// --- Multer Setup for Shop Logos ---
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// ─── PUBLIC ROUTES ───────────────────────────────────────────

// GET /api/centres - List all centres with optional search
router.get('/', async (req, res) => {
    try {
        const { search, service, lat, lng, radius } = req.query;

        // Selection with Average Rating and Review Count
        let query = `SELECT DISTINCT rc.*, 
            (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE centre_id = rc.centre_id) as rating,
            (SELECT COUNT(*) FROM reviews WHERE centre_id = rc.centre_id) as review_count`;
        const params = [];

        if (lat && lng) {
            query += `, (6371 * acos(cos(radians(?)) * cos(radians(rc.latitude)) * cos(radians(rc.longitude) - radians(?)) + sin(radians(?)) * sin(radians(rc.latitude)))) AS distance_km`;
            params.push(lat, lng, lat);
        }

        query += ` FROM repair_centres rc LEFT JOIN services s ON rc.centre_id = s.centre_id WHERE rc.is_active = TRUE AND rc.is_visible = TRUE`;

        if (search) {
            query += ` AND (rc.name LIKE ? OR rc.address LIKE ? OR rc.district LIKE ? OR s.service_name LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (service) {
            query += ` AND s.service_name LIKE ?`;
            params.push(`%${service}%`);
        }

        // Optimization: Apply bounding box to filter rows cheaply before precise distance calc
        if (lat && lng && radius) {
            const r = parseFloat(radius);
            const latVal = parseFloat(lat);
            const lngVal = parseFloat(lng);
            // 1 deg lat ~ 111km. 1 deg lng ~ 111km * cos(lat)
            const latDelta = r / 111.0;
            const lngDelta = r / (111.0 * Math.cos(latVal * (Math.PI / 180)));

            query += ` AND rc.latitude BETWEEN ? AND ? AND rc.longitude BETWEEN ? AND ?`;
            params.push(latVal - latDelta, latVal + latDelta, lngVal - lngDelta, lngVal + lngDelta);
        }

        if (lat && lng && radius) {
            query += ` HAVING distance_km <= ?`;
            params.push(radius);
        }

        if (lat && lng) {
            query += ` ORDER BY distance_km ASC`;
        } else {
            query += ` ORDER BY rc.name ASC`;
        }

        query += ` LIMIT 50`;

        const [centres] = await pool.query(query, params);

        // Add mock rating for UI compatibility (CentreCard uses 'rating')
        const formatted = centres.map(c => ({
            ...c,
            is_verified: Math.random() > 0.3, // Keeping this for now as per user breakdown (it was mocked)
            logo_url: c.logo_url ? (c.logo_url.startsWith('http') ? c.logo_url : `${req.protocol}://${req.get('host')}/${c.logo_url}`) : null
        }));

        res.json({ success: true, centres: formatted });
    } catch (err) {
        console.error('Get centres error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/centres/:id - Get detailed info including services
router.get('/:id', async (req, res) => {
    try {
        const [centres] = await pool.query(
            `SELECT rc.*,
                (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE centre_id = rc.centre_id) as rating,
                (SELECT COUNT(*) FROM reviews WHERE centre_id = rc.centre_id) as review_count
             FROM repair_centres rc WHERE rc.centre_id = ? AND rc.is_active = TRUE AND rc.is_visible = TRUE`, [req.params.id]
        );

        if (centres.length === 0) {
            return res.status(404).json({ success: false, message: 'Centre not found' });
        }

        const [services] = await pool.query(
            'SELECT * FROM services WHERE centre_id = ? AND is_available = TRUE ORDER BY device_category, service_name', [req.params.id]
        );

        res.json({
            success: true,
            centre: {
                ...centres[0],
                logo_url: centres[0].logo_url ? (centres[0].logo_url.startsWith('http') ? centres[0].logo_url : `${req.protocol}://${req.get('host')}/${centres[0].logo_url}`) : null
            },
            services
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/centres/:id/availability - Get specific date availability
router.get('/:id/availability', async (req, res) => {
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: 'Date required.' });

    try {
        const [centres] = await pool.query(
            'SELECT opening_time, closing_time FROM repair_centres WHERE centre_id = ?', [req.params.id]
        );
        if (centres.length === 0) return res.status(404).json({ success: false, message: 'Centre not found.' });

        const { opening_time, closing_time } = centres[0];
        const slots = [];
        const openH = parseInt(opening_time.split(':')[0]);
        const closeH = parseInt(closing_time.split(':')[0]);

        for (let h = openH; h < closeH; h++) {
            slots.push(`${h < 10 ? '0' + h : h}:00:00`);
        }

        const [booked] = await pool.query(
            "SELECT appointment_time FROM appointments WHERE centre_id = ? AND appointment_date = ? AND status != 'cancelled'", [req.params.id, date]
        );
        const bookedTimes = booked.map(b => b.appointment_time);
        const available = slots.filter(s => !bookedTimes.includes(s));

        res.json({ success: true, date, available_slots: available });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ─── DASHBOARD ROUTES (AUTH REQUIRED) ─────────────────────────

router.get('/my/centre', authMiddleware, async (req, res) => {
    try {
        const [centres] = await pool.query(
            'SELECT * FROM repair_centres WHERE owner_id = ?', [req.user.userId]
        );
        res.json({ success: true, centre: centres[0] || null });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST /api/centres/my/centre - Create a new centre for the logged-in repairer
router.post('/my/centre', authMiddleware, upload.single('logo'), [
    body('name').trim().notEmpty().withMessage('Shop name is required'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    body('district').trim().notEmpty().withMessage('District is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('email').isEmail().withMessage('Valid public email is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    try {
        // Check if user already has a centre
        const [existing] = await pool.query('SELECT centre_id FROM repair_centres WHERE owner_id = ?', [req.user.userId]);
        if (existing.length > 0) return res.status(400).json({ success: false, message: 'You already have a registered centre.' });

        const { name, address, district, phone, email, description, opening_time, closing_time, working_days, latitude, longitude } = req.body;

        let logo_url = null;
        if (req.file) {
            const filename = `shop-${req.user.userId}-${Date.now()}.jpeg`;
            const filepath = path.join('uploads', filename);
            await sharp(req.file.buffer).resize(500, 500, { fit: 'cover' }).toFormat('jpeg').jpeg({ quality: 80 }).toFile(filepath);
            logo_url = `uploads/${filename}`;
        }

        const [result] = await pool.query(
            `INSERT INTO repair_centres (owner_id, name, address, district, phone, email, description, opening_time, closing_time, working_days, latitude, longitude, logo_url) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.user.userId, name, address, district, phone, email, description || '', opening_time, closing_time, working_days, latitude, longitude, logo_url]
        );

        res.status(201).json({ success: true, message: 'Centre created successfully', centreId: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error creating centre' });
    }
});

// PUT /api/centres/my/centre - Update details for the logged-in repairer's centre
router.put('/my/centre', authMiddleware, upload.single('logo'), [
    body('name').trim().notEmpty().withMessage('Shop name is required'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    body('district').trim().notEmpty().withMessage('District is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('email').isEmail().withMessage('Valid public email is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    try {
        const { name, address, district, phone, email, description, opening_time, closing_time, working_days, latitude, longitude } = req.body;

        let logo_url;
        if (req.file) {
            const filename = `shop-${req.user.userId}-${Date.now()}.jpeg`;
            const filepath = path.join('uploads', filename);
            await sharp(req.file.buffer).resize(500, 500, { fit: 'cover' }).toFormat('jpeg').jpeg({ quality: 80 }).toFile(filepath);
            logo_url = `uploads/${filename}`;
        }

        let query = `UPDATE repair_centres SET name=?, address=?, district=?, phone=?, email=?, description=?, opening_time=?, closing_time=?, working_days=?, latitude=?, longitude=?`;
        const params = [name, address, district, phone, email, description || '', opening_time, closing_time, working_days, latitude, longitude];

        if (logo_url) {
            query += `, logo_url=?`;
            params.push(logo_url);
        }
        query += ` WHERE owner_id = ?`;
        params.push(req.user.userId);

        const [result] = await pool.query(query, params);

        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Centre not found' });

        res.json({ success: true, message: 'Centre updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error updating centre' });
    }
});

// GET /api/centres/my/customers - Get unique customers for the logged-in repairer
router.get('/my/customers', authMiddleware, async (req, res) => {
    try {
        const [centres] = await pool.query(
            'SELECT centre_id FROM repair_centres WHERE owner_id = ?', [req.user.userId]
        );

        if (centres.length === 0) {
            return res.status(404).json({ success: false, message: 'Centre not found' });
        }

        const [customers] = await pool.query(`
            SELECT 
                u.user_id, 
                u.name, 
                u.email, 
                u.phone,
                MAX(a.appointment_date) as last_appointment,
                COUNT(a.appointment_id) as total_bookings
            FROM appointments a
            JOIN users u ON a.user_id = u.user_id
            WHERE a.centre_id = ?
            GROUP BY u.user_id, u.name, u.email, u.phone
            ORDER BY last_appointment DESC
        `, [centres[0].centre_id]);

        res.json({ success: true, customers });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/centres/my/services - Get all services for the logged-in repairer
router.get('/my/services', authMiddleware, async (req, res) => {
    try {
        const [centres] = await pool.query('SELECT centre_id FROM repair_centres WHERE owner_id = ?', [req.user.userId]);

        if (centres.length === 0) {
            return res.json({ success: true, services: [] });
        }

        const [services] = await pool.query(
            'SELECT * FROM services WHERE centre_id = ? ORDER BY service_name ASC', [centres[0].centre_id]
        );

        res.json({ success: true, services });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST /api/centres/my/services - Add a new service
router.post('/my/services', authMiddleware, [
    body('service_name').trim().notEmpty().withMessage('Service name is required'),
    body('device_category').isIn(['smartphone', 'tablet', 'laptop', 'desktop', 'other']).withMessage('Invalid device category'),
    body('estimated_duration_minutes').isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
    body('description').optional().trim(),
    body('base_price').optional().isFloat({ min: 0 }),
    body('is_available').optional().isBoolean(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const [centres] = await pool.query('SELECT centre_id FROM repair_centres WHERE owner_id = ?', [req.user.userId]);

        if (centres.length === 0) {
            return res.status(404).json({ success: false, message: 'You do not have a registered repair centre.' });
        }

        const centreId = centres[0].centre_id;
        const { service_name, description, device_category, estimated_duration_minutes, base_price, is_available } = req.body;

        const [result] = await pool.query(
            `INSERT INTO services 
            (centre_id, service_name, description, device_category, estimated_duration_minutes, base_price, is_available) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`, [
            centreId,
            service_name,
            description || '',
            device_category,
            estimated_duration_minutes,
            base_price || null,
            is_available !== undefined ? is_available : true
        ]);

        res.status(201).json({ success: true, message: 'Service added successfully', serviceId: result.insertId });
    } catch (err) {
        console.error('Error adding service:', err);
        res.status(500).json({ success: false, message: 'Server error adding service' });
    }
});

// PUT /api/centres/my/services/:id - Update an existing service
router.put('/my/services/:id', authMiddleware, [
    body('service_name').optional().trim().notEmpty(),
    body('device_category').optional().isIn(['smartphone', 'tablet', 'laptop', 'desktop', 'other']),
    body('estimated_duration_minutes').optional().isInt({ min: 1 }),
    body('description').optional().trim(),
    body('base_price').optional().isFloat({ min: 0 }),
    body('is_available').optional().isBoolean(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const serviceId = req.params.id;

        // Verify ownership
        const [svc] = await pool.query(`
            SELECT s.service_id FROM services s
            JOIN repair_centres rc ON s.centre_id = rc.centre_id
            WHERE s.service_id = ? AND rc.owner_id = ?`, [serviceId, req.user.userId]);

        if (svc.length === 0) {
            return res.status(404).json({ success: false, message: 'Service not found or unauthorized' });
        }

        const { service_name, description, device_category, estimated_duration_minutes, base_price, is_available } = req.body;

        await pool.query(
            `UPDATE services SET
                service_name = COALESCE(?, service_name),
                description = COALESCE(?, description),
                device_category = COALESCE(?, device_category),
                estimated_duration_minutes = COALESCE(?, estimated_duration_minutes),
                base_price = ?,
                is_available = COALESCE(?, is_available)
            WHERE service_id = ?`, [
            service_name || null,
            description !== undefined ? description : null,
            device_category || null,
            estimated_duration_minutes || null,
            base_price !== undefined && base_price !== '' ? base_price : null,
            is_available !== undefined ? is_available : null,
            serviceId
        ]);

        res.json({ success: true, message: 'Service updated successfully' });
    } catch (err) {
        console.error('Update service error:', err);
        res.status(500).json({ success: false, message: 'Server error updating service' });
    }
});

// DELETE /api/centres/my/services/:id - Delete a service
router.delete('/my/services/:id', authMiddleware, async (req, res) => {
    try {
        const serviceId = req.params.id;

        // Verify ownership
        const [services] = await pool.query(`
            SELECT s.service_id 
            FROM services s
            JOIN repair_centres rc ON s.centre_id = rc.centre_id
            WHERE s.service_id = ? AND rc.owner_id = ?`, [serviceId, req.user.userId]);

        if (services.length === 0) {
            return res.status(404).json({ success: false, message: 'Service not found or unauthorized' });
        }

        await pool.query('DELETE FROM services WHERE service_id = ?', [serviceId]);

        res.json({ success: true, message: 'Service deleted successfully' });
    } catch (err) {
        console.error('Delete service error:', err);
        res.status(500).json({ success: false, message: 'Server error deleting service' });
    }
});

// GET /api/centres/my/appointments - Get appointments for the logged-in repairer
router.get('/my/appointments', authMiddleware, async (req, res) => {
    try {
        const [centres] = await pool.query('SELECT centre_id FROM repair_centres WHERE owner_id = ?', [req.user.userId]);

        if (centres.length === 0) {
            return res.json({ success: true, appointments: [] });
        }

        const [appointments] = await pool.query(`
            SELECT a.*, u.name as customer_name, u.phone as customer_phone, u.email as customer_email,
                   s.service_name, d.brand as device_brand, d.model as device_model, d.device_type
            FROM appointments a
            JOIN users u ON a.user_id = u.user_id
            LEFT JOIN services s ON a.service_id = s.service_id
            LEFT JOIN devices d ON a.device_id = d.device_id
            WHERE a.centre_id = ?
            ORDER BY a.appointment_date DESC, a.appointment_time ASC`, [centres[0].centre_id]);

        res.json({ success: true, appointments });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/centres/my/reports - Get dashboard stats
router.get('/my/reports', authMiddleware, async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        const [centres] = await pool.query('SELECT centre_id FROM repair_centres WHERE owner_id = ?', [req.user.userId]);

        if (centres.length === 0) {
            return res.json({ success: true, reports: {} });
        }

        const centreId = centres[0].centre_id;

        // 1. Basic Counts
        const [stats] = await pool.query(`
            SELECT 
                COUNT(*) as total_appointments,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_appointments
            FROM appointments 
            WHERE centre_id = ? AND appointment_date BETWEEN ? AND ?`, [centreId, start_date, end_date]);

        // 2. New Customers (First appointment in this period)
        const [newCust] = await pool.query(`
            SELECT COUNT(*) as count FROM (
                SELECT user_id, MIN(appointment_date) as first_appt 
                FROM appointments 
                WHERE centre_id = ? 
                GROUP BY user_id 
                HAVING first_appt BETWEEN ? AND ?
            ) as t`, [centreId, start_date, end_date]);

        // 3. Monthly Distribution (Last 12 months for chart)
        const [monthly] = await pool.query(`
            SELECT DATE_FORMAT(appointment_date, '%b') as month, COUNT(*) as count
            FROM appointments
            WHERE centre_id = ? AND appointment_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY month
            ORDER BY MIN(appointment_date) ASC`, [centreId]);

        res.json({
            success: true,
            reports: {
                total_appointments: stats[0].total_appointments || 0,
                completed_appointments: stats[0].completed_appointments || 0,
                new_customers: newCust[0].count || 0,
                monthly_appointments: monthly,
                total_revenue: 0 // Placeholder
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;