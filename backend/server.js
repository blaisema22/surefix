require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const initCronJobs = require('./cron-jobs');
const logger = require('./utils/logger');
const { errorMiddleware } = require('./middleware/errorMiddleware');

const app = express();
const server = http.createServer(app); // Wrap express app with HTTP server

// --- Middleware ---
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Socket.io Setup ---
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ["GET", "POST"]
    }
});

// Store active socket connections if needed, or just join rooms based on User ID
io.on('connection', (socket) => {
    // console.log('New client connected:', socket.id);

    // Allow client to join a private room named "user_{userId}"
    socket.on('join_room', (userId) => {
        if (userId) {
            socket.join(`user_${userId}`);
            // console.log(`Socket ${socket.id} joined room user_${userId}`);
        }
    });

    socket.on('disconnect', () => {
        // console.log('Client disconnected:', socket.id);
    });
});

// Make io accessible in all routes via req.io
app.use((req, res, next) => {
    req.io = io;
    next();
});

// --- Secure File Serving for Uploads ---
app.get('/uploads/:filename', async (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);

    // 1. Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
        return res.status(404).send('File not found');
    }

    // 2. Public Assets (Shop Logos)
    // Shop logos are public so they can be seen in search results
    if (filename.startsWith('shop-')) {
        return res.sendFile(filePath);
    }

    // 3. Protected Assets (Appointment Images)
    if (filename.startsWith('appointment-')) {
        // Allow token via Header OR Query Param (useful for <img src="...?token=..."/>)
        const token = req.headers.authorization?.split(' ')[1] || req.query.token;

        if (!token) return res.status(401).send('Unauthorized: No token provided');

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'surefix_secret_key_change_in_production');

            // Admins can view everything
            if (decoded.role === 'admin') return res.sendFile(filePath);

            // Check ownership in Database
            const { pool } = require('./config/db');

            // DB stores paths like "uploads/appointment-123.jpg", match partial filename
            const dbPathLike = `%${filename}`;

            const [rows] = await pool.query(`
                SELECT a.user_id, rc.owner_id 
                FROM appointments a
                JOIN repair_centres rc ON a.centre_id = rc.centre_id
                WHERE a.issue_image_url LIKE ?
            `, [dbPathLike]);

            if (rows.length > 0) {
                const access = rows[0];
                // Allow if user is the Customer OR the Shop Owner
                if (access.user_id === decoded.userId || access.owner_id === decoded.userId) {
                    return res.sendFile(filePath);
                }
            }
            return res.status(403).send('Forbidden: You do not have permission to view this file');
        } catch (err) {
            return res.status(401).send('Unauthorized: Invalid token');
        }
    }

    // Default deny for unknown file types
    res.status(403).send('Access denied');
});

// --- API Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/devices', require('./routes/devices'));
app.use('/api/centres', require('./routes/centres'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/services', require('./routes/services'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/sms', require('./routes/sms'));

// --- Error Handling ---
// 404 handler
app.all('*', (req, res, next) => {
    const { AppError } = require('./middleware/errorMiddleware');
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error middleware
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => logger.info(`Server running on port ${PORT}`));

// Initialize Cron Jobs
initCronJobs();

module.exports = app; // For supertest