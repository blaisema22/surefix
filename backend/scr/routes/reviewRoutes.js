// Review routes
import express from 'express';
import * as reviewController from '../controllers/reviewController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/:centreId', reviewController.getReviews);
router.post('/', authMiddleware, reviewController.createReview);

export default router;
