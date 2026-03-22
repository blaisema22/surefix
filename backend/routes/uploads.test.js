const request = require('supertest');
const app = require('../server');
const { pool } = require('../config/db');
const { generateToken } = require('./auth.utils');
const fs = require('fs');
const path = require('path');

describe('Secure Uploads Route', () => {
    let customerToken, attackerToken, ownerToken;
    let customerId, attackerId, ownerId, centreId;

    // Define paths for dummy files
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    const publicFile = 'shop-test-logo.jpg';
    const privateFile = 'appointment-test-image.jpg';
    const publicPath = path.join(uploadsDir, publicFile);
    const privatePath = path.join(uploadsDir, privateFile);

    beforeAll(async () => {
        // 1. Ensure uploads directory exists and create dummy files
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
        fs.writeFileSync(publicPath, 'dummy public content');
        fs.writeFileSync(privatePath, 'dummy private content');

        // 2. Create Users
        // Customer (Owner of the appointment)
        const [custRes] = await pool.query('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', ['Cust', 'cust@test.com', 'hash', 'customer']);
        customerId = custRes.insertId;
        customerToken = generateToken({ userId: customerId, role: 'customer' });

        // Attacker (Random user)
        const [attRes] = await pool.query('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', ['Attacker', 'attack@test.com', 'hash', 'customer']);
        attackerId = attRes.insertId;
        attackerToken = generateToken({ userId: attackerId, role: 'customer' });

        // Repairer (Owner of the shop)
        const [ownRes] = await pool.query('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', ['Owner', 'owner@test.com', 'hash', 'repairer']);
        ownerId = ownRes.insertId;
        ownerToken = generateToken({ userId: ownerId, role: 'repairer' });

        // 3. Create Centre
        const [cenRes] = await pool.query('INSERT INTO repair_centres (owner_id, name, address) VALUES (?, ?, ?)', [ownerId, 'Test Shop', 'Address']);
        centreId = cenRes.insertId;

        // 4. Create Appointment linked to the private file
        // Note: The route searches using `LIKE %filename`, so storing "uploads/..." works
        await pool.query(
            'INSERT INTO appointments (user_id, centre_id, device_id, service_id, appointment_date, appointment_time, status, issue_image_url) VALUES (?, ?, 1, 1, CURDATE(), "10:00:00", "pending", ?)',
            [customerId, centreId, `uploads/${privateFile}`]
        );
    });

    afterAll(async () => {
        // Cleanup Files
        if (fs.existsSync(publicPath)) fs.unlinkSync(publicPath);
        if (fs.existsSync(privatePath)) fs.unlinkSync(privatePath);

        // Cleanup DB
        await pool.query('DELETE FROM appointments WHERE user_id = ?', [customerId]);
        await pool.query('DELETE FROM repair_centres WHERE owner_id = ?', [ownerId]);
        await pool.query('DELETE FROM users WHERE user_id IN (?, ?, ?)', [customerId, attackerId, ownerId]);
        await pool.end();
    });

    describe('GET /uploads/:filename', () => {

        // --- Public Files ---
        it('should allow access to shop logos without a token', async () => {
            const res = await request(app).get(`/uploads/${publicFile}`);
            expect(res.statusCode).toBe(200);
            // Use binary check or text depending on how supertest handles the mocked file
            expect(res.text).toBeDefined();
        });

        // --- Missing Files ---
        it('should return 404 if file does not exist', async () => {
            const res = await request(app).get('/uploads/non-existent-file.jpg');
            expect(res.statusCode).toBe(404);
        });

        // --- Protected Files (Appointment Images) ---

        it('should block access if no token provided', async () => {
            const res = await request(app).get(`/uploads/${privateFile}`);
            expect(res.statusCode).toBe(401);
        });

        it('should block access if invalid token provided', async () => {
            const res = await request(app).get(`/uploads/${privateFile}?token=invalid_token_123`);
            expect(res.statusCode).toBe(401);
        });

        it('should allow access to the customer who created the appointment (Query Param)', async () => {
            const res = await request(app).get(`/uploads/${privateFile}?token=${customerToken}`);
            expect(res.statusCode).toBe(200);
        });

        it('should allow access to the customer who created the appointment (Header)', async () => {
            const res = await request(app)
                .get(`/uploads/${privateFile}`)
                .set('Authorization', `Bearer ${customerToken}`);
            expect(res.statusCode).toBe(200);
        });

        it('should allow access to the shop owner (Recipient)', async () => {
            const res = await request(app).get(`/uploads/${privateFile}?token=${ownerToken}`);
            expect(res.statusCode).toBe(200);
        });

        it('should block access to an unauthorized user (Attacker)', async () => {
            const res = await request(app).get(`/uploads/${privateFile}?token=${attackerToken}`);
            expect(res.statusCode).toBe(403);
        });
    });
});