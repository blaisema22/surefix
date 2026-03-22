const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Middleware: Ensure only admins can access reports
router.use(authMiddleware);
router.use(adminMiddleware);

/**
 * @route   GET /api/reports/download
 * @desc    Download CSV reports for admin analytics
 * @access  Private (Admin)
 * @query   type (users | appointments | centres)
 */
router.get('/download', async (req, res) => {
    const { type } = req.query;
    let query = '';
    let filename = `report-${type}-${Date.now()}.csv`;

    try {
        // 1. Select Query based on type
        switch (type) {
            case 'users':
                query = `
                    SELECT 
                        user_id, name, email, phone, role, is_verified, created_at 
                    FROM users 
                    ORDER BY created_at DESC
                `;
                break;

            case 'appointments':
                query = `
                    SELECT 
                        a.appointment_id, 
                        a.booking_reference, 
                        u.name as customer_name, 
                        u.email as customer_email,
                        rc.name as centre_name, 
                        s.service_name, 
                        a.appointment_date, 
                        a.appointment_time,
                        a.status, 
                        a.created_at 
                    FROM appointments a
                    LEFT JOIN users u ON a.user_id = u.user_id
                    LEFT JOIN repair_centres rc ON a.centre_id = rc.centre_id
                    LEFT JOIN services s ON a.service_id = s.service_id
                    ORDER BY a.created_at DESC
                `;
                break;

            case 'centres':
                query = `
                    SELECT 
                        rc.centre_id, 
                        rc.name, 
                        rc.address, 
                        rc.district, 
                        u.name as owner_name, 
                        u.email as owner_email,
                        rc.is_active, 
                        rc.created_at 
                    FROM repair_centres rc 
                    LEFT JOIN users u ON rc.owner_id = u.user_id
                    ORDER BY rc.created_at DESC
                `;
                break;

            default:
                return res.status(400).json({ success: false, message: 'Invalid report type specified' });
        }

        // 2. Execute Query
        const [rows] = await pool.query(query);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'No data available for this report' });
        }

        // 3. Convert to CSV
        const headers = Object.keys(rows[0]).join(',');
        const csvData = rows.map(row => Object.values(row).map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(',')).join('\n');
        const csvContent = `${headers}\n${csvData}`;

        // 4. Send Response
        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', `attachment; filename="${filename}"`);
        res.status(200).send(csvContent);

    } catch (err) {
        console.error('Report generation error:', err);
        res.status(500).json({ success: false, message: 'Server error generating report' });
    }
});

module.exports = router;