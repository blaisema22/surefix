const router = require('express').Router();
const ctrl   = require('../controllers/profileController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);

/**
 * @route  PUT /api/profile/customer
 * @desc   Update customer profile & notification preferences
 * @access Private (customer)
 * @body   { firstName?, lastName?, phone?, location?,
 *           prefEmail?, prefSms?, prefMarketing? }
 */
router.put('/customer', requireRole('customer'), ctrl.updateCustomerProfile);

/**
 * @route  PUT /api/profile/shop
 * @desc   Update shop owner profile
 * @access Private (shop)
 * @body   { phone?, companyName?, ownerName?, address?, tinNumber?, openHours? }
 */
router.put('/shop', requireRole('shop'), ctrl.updateShopProfile);

/**
 * @route  PUT /api/profile/password
 * @desc   Change account password
 * @access Private (any role)
 * @body   { currentPassword, newPassword }
 */
router.put('/password', ctrl.changePassword);

/**
 * @route  GET /api/profile/customers
 * @desc   Shop owner retrieves list of their customers
 * @access Private (shop)
 */
router.get('/customers', requireRole('shop'), ctrl.listShopCustomers);

module.exports = router;
