// Service routes
import express from 'express';
import * as serviceController from '../controllers/serviceController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/', serviceController.getServices);
router.get('/:id', serviceController.getService);
router.post('/', authMiddleware, serviceController.createService);

export default router;
