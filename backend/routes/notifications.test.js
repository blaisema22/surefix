const request = require('supertest');
const app = require('../server'); // Your Express app
const { pool } = require('../config/db'); // Import your database connection
const { generateToken } = require('./auth.utils'); // Utility to generate auth tokens

describe('Notification Routes', () => {
    let userToken;
    let testUserId;
    let adminToken;
    let adminUserId;
    let notificationId;

    // Use unique emails to prevent collision if previous tests didn't clean up
    const timestamp = Date.now();
    const userEmail = `notif_test_${timestamp}@example.com`;
    const adminEmail = `notif_admin_${timestamp}@example.com`;

    beforeAll(async () => {
        // 1. Create a test user
        const [userResult] = await pool.query(
            'INSERT INTO users (name, email, password_hash, role, is_verified) VALUES (?, ?, ?, ?, ?)',
            ['Notif Test User', userEmail, 'dummyhash', 'customer', true]
        );
        testUserId = userResult.insertId;
        userToken = generateToken({ userId: testUserId, role: 'customer' });

        // 2. Create a test admin (for creating notifications)
        const [adminResult] = await pool.query(
            'INSERT INTO users (name, email, password_hash, role, is_verified) VALUES (?, ?, ?, ?, ?)',
            ['Notif Admin', adminEmail, 'dummyhash', 'admin', true]
        );
        adminUserId = adminResult.insertId;
        adminToken = generateToken({ userId: adminUserId, role: 'admin' });

        // 3. Create a test notification
        const [notifResult] = await pool.query(
            'INSERT INTO notifications (user_id, title, message, is_read) VALUES (?, ?, ?, ?)',
            [testUserId, 'Test Notification', 'This is a test message', false]
        );
        notificationId = notifResult.insertId;
    });

    afterAll(async () => {
        // Cleanup
        if (testUserId) await pool.query('DELETE FROM notifications WHERE user_id = ?', [testUserId]);
        if (testUserId || adminUserId) {
            await pool.query('DELETE FROM users WHERE user_id IN (?, ?)', [testUserId, adminUserId]);
        }
        await pool.end();
    });

    describe('GET /api/notifications', () => {
        it('should fetch notifications for the current user', async () => {
            const res = await request(app)
                .get('/api/notifications')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.notifications)).toBe(true);
            expect(res.body.notifications.length).toBeGreaterThan(0);
            expect(res.body.notifications[0].title).toBe('Test Notification');
        });

        it('should return paginated results', async () => {
            // Create dummy notifications to test pagination
            for (let i = 0; i < 5; i++) {
                await pool.query(
                    'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
                    [testUserId, `Page Test ${i}`, `Message ${i}`]
                );
            }

            const res = await request(app)
                .get('/api/notifications?page=1&limit=2')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.notifications.length).toBe(2);
            expect(res.body.pagination).toBeDefined();
            expect(res.body.pagination.total).toBeGreaterThanOrEqual(5);
            expect(res.body.pagination.page).toBe(1);
        });

        it('should return 401 if not authenticated', async () => {
            const res = await request(app).get('/api/notifications');
            expect(res.statusCode).toBe(401);
        });
    });

    describe('PATCH /api/notifications/:id/read', () => {
        it('should mark a specific notification as read', async () => {
            const res = await request(app)
                .patch(`/api/notifications/${notificationId}/read`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);

            // Verify in DB
            const [rows] = await pool.query('SELECT is_read FROM notifications WHERE notification_id = ?', [notificationId]);
            expect(rows[0].is_read).toBe(1); // 1 is true in MySQL boolean/tinyint
        });

        it('should return 404 for a non-existent notification', async () => {
            const res = await request(app)
                .patch('/api/notifications/999999/read')
                .set('Authorization', `Bearer ${userToken}`);
            expect(res.statusCode).toBe(404);
        });
    });

    describe('PATCH /api/notifications/read-all', () => {
        it('should mark all notifications for the user as read', async () => {
            // Create another unread notification first
            await pool.query(
                'INSERT INTO notifications (user_id, title, message, is_read) VALUES (?, ?, ?, ?)',
                [testUserId, 'Second Notification', 'Another message', false]
            );

            const res = await request(app)
                .patch('/api/notifications/read-all')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);

            // Verify all are read
            const [rows] = await pool.query('SELECT * FROM notifications WHERE user_id = ? AND is_read = 0', [testUserId]);
            expect(rows.length).toBe(0);
        });
    });

    describe('POST /api/notifications', () => {
        it('should allow an admin to create a notification', async () => {
            const res = await request(app)
                .post('/api/notifications')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    target_user_id: testUserId,
                    title: 'Admin Alert',
                    message: 'System update coming soon'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.notification.title).toBe('Admin Alert');
        });

        it('should forbid a regular user from creating a notification', async () => {
            const res = await request(app)
                .post('/api/notifications')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    target_user_id: testUserId,
                    title: 'Hacked Alert',
                    message: 'This should not work'
                });

            expect(res.statusCode).toBe(403);
            expect(res.body.success).toBe(false);
        });
    });

    describe('DELETE /api/notifications/clear-all', () => {
        it('should delete all notifications for the user', async () => {
            const res = await request(app)
                .delete('/api/notifications/clear-all')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);

            const [rows] = await pool.query('SELECT * FROM notifications WHERE user_id = ?', [testUserId]);
            expect(rows.length).toBe(0);
        });
    });
});