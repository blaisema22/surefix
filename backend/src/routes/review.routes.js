const router  = require('express').Router();
const { body } = require('express-validator');
const ctrl    = require('../controllers/reviewController');
const { authenticate, requireRole } = require('../middleware/auth');

const reviewRules = [
  body('appointmentId').notEmpty().withMessage('appointmentId is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
];

/**
 * @route  GET /api/reviews/shop/:shopId
 * @desc   Get all reviews for a repair shop
 * @access Public
 */
router.get('/shop/:shopId', ctrl.listShopReviews);

/**
 * @route  POST /api/reviews
 * @desc   Submit a review for a completed appointment
 * @access Private (customer only)
 * @body   { appointmentId, rating (1-5), comment? }
 */
router.post('/', authenticate, requireRole('customer'), reviewRules, ctrl.createReview);

module.exports = router;
