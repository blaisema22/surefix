const router = require('express').Router();
const ctrl   = require('../controllers/dashboardController');
const { authenticate, requireRole } = require('../middleware/auth');

/**
 * @route  GET /api/dashboard/customer
 * @desc   Customer dashboard stats + active appointments
 * @access Private (customer)
 */
router.get('/customer', authenticate, requireRole('customer'), ctrl.customerStats);

/**
 * @route  GET /api/dashboard/shop
 * @desc   Shop dashboard stats + today's schedule
 * @access Private (shop)
 */
router.get('/shop', authenticate, requireRole('shop'), ctrl.shopStats);

module.exports = router;
