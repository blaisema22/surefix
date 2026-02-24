import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './scr/cofig/database.js';
import errorHandler from './scr/middleware/errorHandler.js';
import authRoutes from './scr/routes/authRoutes.js';
import userRoutes from './scr/routes/userRoutes.js';
import centreRoutes from './scr/routes/centreRoutes.js';
import deviceRoutes from './scr/routes/deviceRoutes.js';
import serviceRoutes from './scr/routes/serviceRoutes.js';
import appointmentRoutes from './scr/routes/appointmentRoutes.js';
import reviewRoutes from './scr/routes/reviewRoutes.js';
import notificationRoutes from './scr/routes/notificationRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database
await initDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/centres', centreRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});