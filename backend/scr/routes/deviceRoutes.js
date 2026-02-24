// Device routes
import express from 'express';
import * as deviceController from '../controllers/deviceController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, deviceController.getDevices);
router.post('/', authMiddleware, deviceController.addDevice);
router.delete('/:id', authMiddleware, deviceController.deleteDevice);

export default router;
