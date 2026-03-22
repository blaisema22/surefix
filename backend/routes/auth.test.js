const request = require('supertest');
const app = require('../server'); // Your Express app
const { pool } = require('../config/db'); // Import your database connection
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Auth Routes', () => {
    let testUserId;
    let testUserEmail = 'test@example.com';
    let jwtSecret = process.env.JWT_SECRET || 'surefix_secret_key_change_in_production';

    beforeAll(async() => {
        // Initialize or seed your database before running tests
        // Create a test user
        const passwordHash = bcrypt.hashSync('password123', 10);
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password_hash, role, is_verified) VALUES (?, ?, ?, ?, ?)', ['Test User', testUserEmail, passwordHash, 'customer', true]
        );
        testUserId = result.insertId;
    });

    afterAll(async() => {
        // Clean up your database after running tests
        // Delete the test user
        await pool.query('DELETE FROM users WHERE user_id = ?', [testUserId]);
        await pool.end(); // Close the connection pool
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user', async() => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'New Test User',
                    email: 'newtest@example.com',
                    password: 'password123'
                });
            expect(response.statusCode).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Registration successful');

            // Clean up the newly registered user
            await pool.query('DELETE FROM users WHERE email = ?', ['newtest@example.com']);
        });

        it('should return an error if the email is already registered', async() => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: testUserEmail, // Same email as above
                    password: 'password123'
                });
            expect(response.statusCode).toBe(409);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Email already registered');
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login an existing user', async() => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUserEmail,
                    password: 'password123'
                });
            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Login successful');
            expect(response.body.token).toBeDefined();
            expect(response.body.user).toBeDefined();
        });

        it('should return an error for invalid credentials', async() => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUserEmail,
                    password: 'wrongpassword'
                });
            expect(response.statusCode).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Invalid credentials');
        });

        it('should return an error for a non-existent email', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@email.com',
                    password: 'password123'
                });
            expect(response.statusCode).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Invalid credentials');
        });
    });

    describe('GET /api/auth/me', () => {
        it('should get the current user', async() => {
            // Login to get a valid token
            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUserEmail,
                    password: 'password123'
                });
            const token = loginResponse.body.token;

            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.user).toBeDefined();
            expect(response.body.user.email).toBe(testUserEmail);
        });

        it('should return an error if no token is provided', async() => {
            const response = await request(app)
                .get('/api/auth/me');

            expect(response.statusCode).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('No token provided.');
        });
    });

    describe('PUT /api/auth/profile', () => {
        it('should update the user profile', async() => {
            // Login to get a valid token
            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUserEmail,
                    password: 'password123'
                });
            const token = loginResponse.body.token;

            const response = await request(app)
                .put('/api/auth/profile')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Updated Test User',
                    phone: '123-456-7890'
                });

            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Profile updated');

            // Verify the update
            const [updatedUser] = await pool.query('SELECT name, phone FROM users WHERE user_id = ?', [testUserId]);
            expect(updatedUser[0].name).toBe('Updated Test User');
            expect(updatedUser[0].phone).toBe('123-456-7890');

            // Revert the changes
            await pool.query('UPDATE users SET name = ?, phone = ? WHERE user_id = ?', ['Test User', null, testUserId]);
        });
    });

    describe('POST /api/auth/forgot-password', () => {
        it('should return success message even if email does not exist', async() => {
            const response = await request(app)
                .post('/api/auth/forgot-password')
                .send({
                    email: 'nonexistent@example.com'
                });

            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('If the email exists, a reset link will be sent');
        });

        it('should return success message if email exists', async() => {
            const response = await request(app)
                .post('/api/auth/forgot-password')
                .send({
                    email: testUserEmail
                });

            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('If the email exists, a reset link will be sent');
        });
    });

    describe('POST /api/auth/reset-password', () => {
        it('should return an error for invalid or expired token', async() => {
            const response = await request(app)
                .post('/api/auth/reset-password')
                .send({
                    token: 'invalid_token',
                    newPassword: 'newpassword123'
                });

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Invalid or expired token');
        });
    });
});