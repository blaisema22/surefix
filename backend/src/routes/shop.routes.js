const router = require('express').Router();
const ctrl   = require('../controllers/shopController');
const { authenticate, requireRole } = require('../middleware/auth');

/**
 * @route  GET /api/shops
 * @desc   List all repair shops (with optional filters)
 * @access Public
 * @query  search?, specialization?, status?
 */
router.get('/', ctrl.listShops);

/**
 * @route  GET /api/shops/:id
 * @desc   Get a single shop by ID
 * @access Public
 */
router.get('/:id', ctrl.getShop);

/**
 * @route  GET /api/shops/:id/slots
 * @desc   Get available time slots for a shop on a given date
 * @access Public
 * @query  date=YYYY-MM-DD (required)
 */
router.get('/:id/slots', ctrl.getAvailableSlots);

/**
 * @route  PUT /api/shops/profile
 * @desc   Shop owner updates their own shop profile
 * @access Private (shop only)
 * @body   { companyName?, ownerName?, address?, tinNumber?, openHours?,
 *           specialization?, status?, specializations?: string[] }
 */
router.put('/profile', authenticate, requireRole('shop'), ctrl.updateProfile);

module.exports = router;
