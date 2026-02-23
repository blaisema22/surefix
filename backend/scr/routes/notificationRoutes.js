// Notification routes
import express from 'express';
import * as notificationController from '../controllers/notificationController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, notificationController.getNotifications);
router.post('/', authMiddleware, notificationController.sendNotification);

export default router;
