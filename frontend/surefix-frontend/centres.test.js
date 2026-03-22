const request = require('supertest');
const app = require('../server'); // Your Express app
const { pool } = require('../config/db'); // Import your database connection
const { generateToken } = require('./auth.utils'); // Utility to generate auth tokens

describe('Centre Routes', () => {
    let repairerToken;
    let adminToken;
    let testCentreId;
    let testRepairerId;

    beforeAll(async() => {
        // Set up test data
        // Create a test repairer user
        const [repairerResult] = await pool.query(
            'INSERT INTO users (name, email, password_hash, role, is_verified) VALUES (?, ?, ?, ?, ?)', ['Test Repairer', 'repairer@example.com', '$2a$10$passwordhash', 'repairer', true]
        );
        testRepairerId = repairerResult.insertId;
        repairerToken = generateToken({ userId: testRepairerId, role: 'repairer' });

        // Create a test admin user
        const [adminResult] = await pool.query(
            'INSERT INTO users (name, email, password_hash, role, is_verified) VALUES (?, ?, ?, ?, ?)', ['Test Admin', 'admin@example.com', '$2a$10$passwordhash', 'admin', true]
        );
        const testAdminId = adminResult.insertId;
        adminToken = generateToken({ userId: testAdminId, role: 'admin' });

        // Create a test repair centre
        const [centreResult] = await pool.query(
            'INSERT INTO repair_centres (owner_id, name, address) VALUES (?, ?, ?)', [testRepairerId, 'Test Centre', '123 Test Street']
        );
        testCentreId = centreResult.insertId;

    });

    afterAll(async() => {
        // Clean up test data
        await pool.query('DELETE FROM repair_centres WHERE owner_id = ?', [testRepairerId]);
        await pool.query('DELETE FROM users WHERE user_id IN (?, ?)', [testRepairerId, 14]);
        await pool.end(); // Close the connection pool
    });

    describe('GET /api/centres', () => {
        it('should get a list of centres', async() => {
            const response = await request(app).get('/api/centres');
            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.centres)).toBe(true);
        });

        it('should search for centres by name', async() => {
            const response = await request(app).get('/api/centres?search=Test');
            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.centres)).toBe(true);
            // Further assertions can be made to validate the search results
        });
    });

    describe('GET /api/centres/:id', () => {
        it('should get a centre by id', async() => {
            const response = await request(app).get(`/api/centres/${testCentreId}`);
            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.centre).toBeDefined();
            expect(response.body.services).toBeDefined();
        });

        it('should return 404 for a non-existent centre', async() => {
            const response = await request(app).get('/api/centres/9999');
            expect(response.statusCode).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /api/centres/:id/availability', () => {
        it('should get availability for a centre', async() => {
            const response = await request(app).get(`/api/centres/${testCentreId}/availability?date=2024-07-05`);
            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.available_slots).toBeDefined();
            expect(response.body.booked_slots).toBeDefined();
        });

        it('should return 400 if date is missing', async() => {
            const response = await request(app).get(`/api/centres/${testCentreId}/availability`);
            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /api/centres/my/centre', () => {
        it('should get the repairer\'s centre', async() => {
            const response = await request(app)
                .get('/api/centres/my/centre')
                .set('Authorization', `Bearer ${repairerToken}`);
            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.centre).toBeDefined();
        });

        it('should return 403 for non-repairer role', async() => {
            const nonRepairerToken = generateToken({ userId: 999, role: 'customer' }); // customer role
            const response = await request(app)
                .get('/api/centres/my/centre')
                .set('Authorization', `Bearer ${nonRepairerToken}`);
            expect(response.statusCode).toBe(403);
            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/centres/my/centre', () => {
        it('should register a new centre for the repairer', async() => {
            const response = await request(app)
                .post('/api/centres/my/centre')
                .set('Authorization', `Bearer ${repairerToken}`)
                .send({
                    name: 'New Centre',
                    address: 'New Address'
                });
            expect(response.statusCode).toBe(201);
            expect(response.body.success).toBe(true);

            // Clean up
            await pool.query('DELETE FROM repair_centres WHERE name = ? AND address = ?', ['New Centre', 'New Address']);
        });

        it('should return 400 if centre name is missing', async() => {
            const response = await request(app)
                .post('/api/centres/my/centre')
                .set('Authorization', `Bearer ${repairerToken}`)
                .send({ address: 'Some Address' });
            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('PUT /api/centres/my/centre', () => {
        it('should update the repairer\'s centre', async() => {
            const response = await request(app)
                .put('/api/centres/my/centre')
                .set('Authorization', `Bearer ${repairerToken}`)
                .send({
                    name: 'Updated Centre Name'
                });
            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);

            // Revert the changes
            await pool.query('UPDATE repair_centres SET name = ? WHERE owner_id = ?', ['Test Centre', testRepairerId]);
        });
    });

    describe('GET /api/centres/my/services', () => {
        it('should get the repairer\'s services', async() => {
            const response = await request(app)
                .get('/api/centres/my/services')
                .set('Authorization', `Bearer ${repairerToken}`);
            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.services)).toBe(true);
        });
    });

    describe('POST /api/centres/my/services', () => {
        it('should add a new service to the repairer\'s centre', async() => {
            const response = await request(app)
                .post('/api/centres/my/services')
                .set('Authorization', `Bearer ${repairerToken}`)
                .send({
                    service_name: 'New Service',
                    device_category: 'smartphone'
                });
            expect(response.statusCode).toBe(201);
            expect(response.body.success).toBe(true);

            // Clean up
            await pool.query('DELETE FROM services WHERE service_name = ? AND centre_id = ?', ['New Service', testCentreId]);
        });
    });

    describe('PUT /api/centres/my/services/:id', () => {
        it('should update a service', async() => {
            // First, create a service to update
            const [serviceResult] = await pool.query(
                'INSERT INTO services (centre_id, service_name, device_category) VALUES (?, ?, ?)', [testCentreId, 'Temp Service', 'smartphone']
            );
            const tempServiceId = serviceResult.insertId;

            const response = await request(app)
                .put(`/api/centres/my/services/${tempServiceId}`)
                .set('Authorization', `Bearer ${repairerToken}`)
                .send({ service_name: 'Updated Service Name' });
            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);

            // Clean up the temporary service
            await pool.query('DELETE FROM services WHERE service_id = ?', [tempServiceId]);
        });
    });

    describe('DELETE /api/centres/my/services/:id', () => {
        it('should delete a service', async() => {
            // First, create a service to delete
            const [serviceResult] = await pool.query(
                'INSERT INTO services (centre_id, service_name, device_category) VALUES (?, ?, ?)', [testCentreId, 'Temp Service', 'smartphone']
            );
            const tempServiceId = serviceResult.insertId;

            const response = await request(app)
                .delete(`/api/centres/my/services/${tempServiceId}`)
                .set('Authorization', `Bearer ${repairerToken}`);
            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });

    describe('GET /api/centres/my/appointments', () => {
        it('should get the repairer\'s appointments', async() => {
            const response = await request(app)
                .get('/api/centres/my/appointments')
                .set('Authorization', `Bearer ${repairerToken}`);
            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.appointments)).toBe(true);
        });
    });

    describe('PATCH /api/centres/admin/:id/visibility', () => {
        it('should update centre visibility by admin', async() => {
            const response = await request(app)
                .patch(`/api/centres/admin/${testCentreId}/visibility`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ is_visible: false });
            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);

            // Revert visibility
            await pool.query('UPDATE repair_centres SET is_visible = 1 WHERE centre_id = ?', [testCentreId]);
        });
    });
});