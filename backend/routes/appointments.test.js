const request = require('supertest');
const app = require('../server');
const { pool } = require('../config/db');
const { generateToken } = require('./auth.utils');
const path = require('path');
const fs = require('fs');

describe('Appointment Routes', () => {
    let userToken;
    let testUserId;
    let testCentreId;
    let testDeviceId;
    let testServiceId;

    // Helper to create a dummy image file for testing
    const testImagePath = path.join(__dirname, 'test-image.jpg');

    beforeAll(async () => {
        // Create a dummy file
        fs.writeFileSync(testImagePath, 'dummy image content');

        // 1. Create a test user
        const [userResult] = await pool.query(
            'INSERT INTO users (name, email, password_hash, role, is_verified) VALUES (?, ?, ?, ?, ?)',
            ['Appt Test User', 'appttest@example.com', 'dummyhash', 'customer', true]
        );
        testUserId = userResult.insertId;
        userToken = generateToken({ userId: testUserId, role: 'customer' });

        // 2. Create a test centre
        const [centreResult] = await pool.query(
            'INSERT INTO repair_centres (name, address, owner_id) VALUES (?, ?, ?)',
            ['Test Centre', '123 Test St', testUserId]
        );
        testCentreId = centreResult.insertId;

        // 3. Create a test service
        const [serviceResult] = await pool.query(
            'INSERT INTO services (centre_id, service_name, device_category) VALUES (?, ?, ?)',
            [testCentreId, 'Screen Repair', 'smartphone']
        );
        testServiceId = serviceResult.insertId;

        // 4. Create a test device
        const [deviceResult] = await pool.query(
            'INSERT INTO devices (user_id, brand, model, device_type) VALUES (?, ?, ?, ?)',
            [testUserId, 'TestBrand', 'TestModel', 'smartphone']
        );
        testDeviceId = deviceResult.insertId;
    });

    afterAll(async () => {
        // Cleanup DB
        await pool.query('DELETE FROM appointments WHERE user_id = ?', [testUserId]);
        await pool.query('DELETE FROM devices WHERE user_id = ?', [testUserId]);
        await pool.query('DELETE FROM services WHERE centre_id = ?', [testCentreId]);
        await pool.query('DELETE FROM repair_centres WHERE centre_id = ?', [testCentreId]);
        await pool.query('DELETE FROM users WHERE user_id = ?', [testUserId]);

        // Cleanup File
        if (fs.existsSync(testImagePath)) {
            fs.unlinkSync(testImagePath);
        }
        await pool.end();
    });

    describe('POST /api/appointments', () => {
        it('should create an appointment with an image upload', async () => {
            const res = await request(app)
                .post('/api/appointments')
                .set('Authorization', `Bearer ${userToken}`)
                .field('centre_id', testCentreId)
                .field('service_id', testServiceId)
                .field('device_id', testDeviceId)
                .field('appointment_date', new Date().toISOString().split('T')[0])
                .field('appointment_time', '10:00')
                .field('issue_description', 'Screen is cracked')
                .attach('deviceImage', testImagePath);

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.appointment).toBeDefined();

            // Verify DB persistence
            const [rows] = await pool.query('SELECT * FROM appointments WHERE appointment_id = ?', [res.body.appointment.appointment_id]);
            expect(rows.length).toBe(1);
            expect(rows[0].issue_description).toBe('Screen is cracked');
            expect(rows[0].issue_image_url).toBeTruthy();
            expect(rows[0].issue_image_url).toMatch(/uploads\/appointment-/);
        });
    });
});