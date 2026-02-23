// Centre routes
import express from 'express';
import * as centreController from '../controllers/centreController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/', centreController.getAllCentres);
router.get('/:id', centreController.getCentre);
router.post('/', authMiddleware, centreController.createCentre);

export default router;
