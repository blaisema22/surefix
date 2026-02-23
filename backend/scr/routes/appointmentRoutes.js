// Appointment routes
import express from 'express';
import * as appointmentController from '../controllers/appointmentController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, appointmentController.getallapp);
router.post('/', authMiddleware, appointmentController.addapp);
router.put('/:id', authMiddleware, appointmentController.updateapp);
router.get('/:id', appointmentController.getappbyId);
router.delete('/:id', authMiddleware, appointmentController.deleteappbyId);

export default router;
