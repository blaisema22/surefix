const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const authMiddleware = require('../middleware/auth');

// GET /api/devices - Get all devices for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const [devices] = await pool.query(
            'SELECT * FROM devices WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.userId]
        );
        res.json({ success: true, devices });
    } catch (err) {
        console.error('Error fetching devices:', err);
        res.status(500).json({ success: false, message: 'Server error fetching devices' });
    }
});

// POST /api/devices - Add a new device
router.post('/', authMiddleware, async (req, res) => {
    const { brand, model, device_type, serial_number, purchase_year, issue_description } = req.body;
    
    if (!brand || !model || !device_type) {
        return res.status(400).json({ success: false, message: 'Brand, model, and device type are required.' });
    }

    try {
        const [result] = await pool.query(
            `INSERT INTO devices (user_id, brand, model, device_type, serial_number, purchase_year, issue_description)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [req.user.userId, brand, model, device_type, serial_number || null, purchase_year || null, issue_description || '']
        );

        res.status(201).json({
            success: true,
            message: 'Device added successfully',
            device: {
                device_id: result.insertId,
                brand,
                model,
                device_type
            }
        });
    } catch (err) {
        console.error('Error adding device:', err);
        res.status(500).json({ success: false, message: 'Server error adding device' });
    }
});

// PUT /api/devices/:id - Update a device
router.put('/:id', authMiddleware, async (req, res) => {
    const { brand, model, device_type, serial_number, purchase_year, issue_description } = req.body;
    const deviceId = req.params.id;

    try {
        const [result] = await pool.query(
            `UPDATE devices 
             SET brand = ?, model = ?, device_type = ?, serial_number = ?, purchase_year = ?, issue_description = ?
             WHERE device_id = ? AND user_id = ?`,
            [brand, model, device_type, serial_number || null, purchase_year || null, issue_description || '', deviceId, req.user.userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Device not found or unauthorized' });
        }

        res.json({ success: true, message: 'Device updated successfully' });
    } catch (err) {
        console.error('Error updating device:', err);
        res.status(500).json({ success: false, message: 'Server error updating device' });
    }
});

// DELETE /api/devices/:id - Delete a device
router.delete('/:id', authMiddleware, async (req, res) => {
    const deviceId = req.params.id;

    try {
        const [result] = await pool.query(
            'DELETE FROM devices WHERE device_id = ? AND user_id = ?',
            [deviceId, req.user.userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Device not found or unauthorized' });
        }

        res.json({ success: true, message: 'Device deleted successfully' });
    } catch (err) {
        console.error('Error deleting device:', err);
        res.status(500).json({ success: false, message: 'Server error deleting device' });
    }
});

module.exports = router;