const request = require('supertest');
const app = require('../server');
const { pool } = require('../config/db');
const { generateToken } = require('./auth.utils');
const bcrypt = require('bcryptjs');

describe('Admin User Management', () => {
    let adminToken;
    let adminUserId;
    let testUserId;
    const testUserEmail = 'ban_test_user@example.com';
    const testUserPassword = 'password123';

    beforeAll(async () => {
        // 1. Create Admin User
        const [adminRes] = await pool.query(
            'INSERT INTO users (name, email, password_hash, role, is_verified, is_authorized) VALUES (?, ?, ?, ?, ?, ?)',
            ['Admin Tester', 'admin_ban_test@example.com', 'dummyhash', 'admin', true, true]
        );
        adminUserId = adminRes.insertId;
        adminToken = generateToken({ userId: adminUserId, role: 'admin' });

        // 2. Create Regular User to be banned
        const hash = bcrypt.hashSync(testUserPassword, 10);
        const [userRes] = await pool.query(
            'INSERT INTO users (name, email, password_hash, role, is_verified, is_authorized) VALUES (?, ?, ?, ?, ?, ?)',
            ['User To Ban', testUserEmail, hash, 'customer', true, true]
        );
        testUserId = userRes.insertId;
    });

    afterAll(async () => {
        // Cleanup
        await pool.query('DELETE FROM users WHERE user_id IN (?, ?)', [adminUserId, testUserId]);
        await pool.end();
    });

    describe('PATCH /api/admin/users/:id/authorize', () => {
        it('should verify that a banned user cannot login', async () => {
            // Step 1: Confirm user can login initially
            const initialLogin = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUserEmail,
                    password: testUserPassword
                });
            expect(initialLogin.statusCode).toBe(200);

            // Step 2: Admin bans the user
            const banRes = await request(app)
                .patch(`/api/admin/users/${testUserId}/authorize`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ is_authorized: false });
            
            expect(banRes.statusCode).toBe(200);
            expect(banRes.body.success).toBe(true);

            // Step 3: Confirm user can NO LONGER login
            const failedLogin = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUserEmail,
                    password: testUserPassword
                });
            
            expect(failedLogin.statusCode).toBe(403);
            expect(failedLogin.body.success).toBe(false);
            expect(failedLogin.body.message).toMatch(/account access has been revoked/i);
        });
    });
});