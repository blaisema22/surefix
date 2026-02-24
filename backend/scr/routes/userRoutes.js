// User routes
import express from 'express';
import * as userController from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/:id', authMiddleware, userController.getUser);
router.put('/:id', authMiddleware, userController.updateUser);
router.delete('/:id', authMiddleware, userController.deleteUser);

export default router;
