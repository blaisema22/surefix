const request = require('supertest');
const app = require('../server');
const { pool } = require('../config/db');

describe('Services Routes', () => {
    let ownerId;
    let centreId1;
    let centreId2;
    
    // Setup data before tests
    beforeAll(async () => {
        // 1. Create a dummy owner
        const [userRes] = await pool.query(
            `INSERT INTO users (name, email, password_hash, role, is_verified) 
             VALUES ('ServiceTest Owner', 'servicetest@example.com', 'hash', 'repairer', 1)`
        );
        ownerId = userRes.insertId;

        // 2. Create two test centres
        const [c1] = await pool.query(
            `INSERT INTO repair_centres (owner_id, name, district, is_active, is_visible) 
             VALUES (?, 'ServiceTest Centre A', 'Kicukiro', 1, 1)`,
            [ownerId]
        );
        centreId1 = c1.insertId;

        const [c2] = await pool.query(
            `INSERT INTO repair_centres (owner_id, name, district, is_active, is_visible) 
             VALUES (?, 'ServiceTest Centre B', 'Gasabo', 1, 1)`,
            [ownerId]
        );
        centreId2 = c2.insertId;

        // 3. Insert test services
        // Centre 1: Smartphone Screen Repair
        await pool.query(
            `INSERT INTO services (centre_id, service_name, device_category, description, is_available) 
             VALUES (?, 'Screen Replacement', 'smartphone', 'Fix cracked screens', 1)`,
            [centreId1]
        );
        
        // Centre 1: Laptop Battery
        await pool.query(
            `INSERT INTO services (centre_id, service_name, device_category, description, is_available) 
             VALUES (?, 'Battery Replacement', 'laptop', 'New battery for laptops', 1)`,
            [centreId1]
        );

        // Centre 2: Smartphone Screen Repair (Duplicate service name, diff centre)
        await pool.query(
            `INSERT INTO services (centre_id, service_name, device_category, description, is_available) 
             VALUES (?, 'Screen Replacement', 'smartphone', 'Premium screen fix', 1)`,
            [centreId2]
        );
    });

    // Clean up after tests
    afterAll(async () => {
        await pool.query('DELETE FROM services WHERE centre_id IN (?, ?)', [centreId1, centreId2]);
        await pool.query('DELETE FROM repair_centres WHERE owner_id = ?', [ownerId]);
        await pool.query('DELETE FROM users WHERE user_id = ?', [ownerId]);
        await pool.end();
    });

    describe('GET /api/services', () => {
        it('should return all services when no filters are applied', async () => {
            const res = await request(app).get('/api/services');
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.services)).toBe(true);
            // We added at least 3 services
            expect(res.body.services.length).toBeGreaterThanOrEqual(3);
        });

        it('should filter services by centre_id', async () => {
            const res = await request(app).get(`/api/services?centre_id=${centreId1}`);
            expect(res.statusCode).toBe(200);
            const services = res.body.services;
            expect(services.length).toBe(2); // We added 2 services to Centre 1
            // Verify all belong to Centre 1
            services.forEach(s => expect(s.centre_id).toBe(centreId1));
        });

        it('should filter services by category', async () => {
            const res = await request(app).get('/api/services?category=laptop');
            expect(res.statusCode).toBe(200);
            const services = res.body.services;
            // We added 1 laptop service (Centre 1)
            const testService = services.find(s => s.centre_id === centreId1 && s.service_name === 'Battery Replacement');
            expect(testService).toBeDefined();
            // Ensure no smartphones are in the list if we only look at our test data context
            // (Note: other tests running in parallel might affect total count, so we check existence)
            expect(services.some(s => s.device_category === 'smartphone')).toBe(false);
        });

        it('should search services by name', async () => {
            const res = await request(app).get('/api/services?search=Battery');
            expect(res.statusCode).toBe(200);
            const services = res.body.services;
            expect(services.length).toBeGreaterThanOrEqual(1);
            expect(services[0].service_name).toContain('Battery');
        });

        it('should search services by description', async () => {
            const res = await request(app).get('/api/services?search=cracked');
            expect(res.statusCode).toBe(200);
            const services = res.body.services;
            expect(services.length).toBeGreaterThanOrEqual(1);
            expect(services[0].description).toContain('cracked');
        });

        it('should return empty list if no matches found', async () => {
            const res = await request(app).get('/api/services?search=NonExistentServicexyz');
            expect(res.statusCode).toBe(200);
            expect(res.body.services).toEqual([]);
        });
    });
});