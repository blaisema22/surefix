const router  = require('express').Router();
const { body } = require('express-validator');
const ctrl    = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Validation rules
const registerRules = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['customer','shop']).withMessage('Role must be customer or shop'),
];

const loginRules = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
];

/**
 * @route  POST /api/auth/register
 * @desc   Register a new customer or shop owner
 * @access Public
 * @body   { role, email, password, phone?,
 *            [customer] firstName, lastName, location?,
 *            [shop]     companyName, ownerName, address, tinNumber?, openHours? }
 */
router.post('/register', registerRules, ctrl.register);

/**
 * @route  POST /api/auth/login
 * @desc   Login and receive JWT token
 * @access Public
 * @body   { email, password }
 */
router.post('/login', loginRules, ctrl.login);

/**
 * @route  GET /api/auth/me
 * @desc   Get currently authenticated user profile
 * @access Private
 */
router.get('/me', authenticate, ctrl.me);

/**
 * @route  POST /api/auth/logout
 * @desc   Logout (client discards token)
 * @access Private
 */
router.post('/logout', authenticate, ctrl.logout);

module.exports = router;
