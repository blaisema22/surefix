require('dotenv').config();
const express = require('express');
const cors    = require('cors');

// ── Database connection (initialises pool on import) ─────────────────────────
require('./config/db');

// ── Routes ────────────────────────────────────────────────────────────────────
const authRoutes         = require('./routes/auth.routes');
const shopRoutes         = require('./routes/shop.routes');
const deviceRoutes       = require('./routes/device.routes');
const appointmentRoutes  = require('./routes/appointment.routes');
const serviceRoutes      = require('./routes/service.routes');
const reviewRoutes       = require('./routes/review.routes');
const notificationRoutes = require('./routes/notification.routes');
const profileRoutes      = require('./routes/profile.routes');
const dashboardRoutes    = require('./routes/dashboard.routes');

// ── Middleware ────────────────────────────────────────────────────────────────
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Global middleware ─────────────────────────────────────────────────────────
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods:     ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logger (dev)
if (process.env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`→ ${req.method} ${req.originalUrl}`);
    next();
  });
}

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({ status: 'ok', service: 'SureFix API', time: new Date().toISOString() })
);

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/shops',         shopRoutes);
app.use('/api/devices',       deviceRoutes);
app.use('/api/appointments',  appointmentRoutes);
app.use('/api/services',      serviceRoutes);
app.use('/api/reviews',       reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/profile',       profileRoutes);
app.use('/api/dashboard',     dashboardRoutes);

// ── Error handling ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀  SureFix API running on http://localhost:${PORT}`);
  console.log(`📋  Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
