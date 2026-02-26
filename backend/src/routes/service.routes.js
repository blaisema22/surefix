const router = require('express').Router();
const ctrl   = require('../controllers/serviceController');
const { authenticate } = require('../middleware/auth');

/**
 * @route  GET /api/services
 * @desc   List all active repair services
 * @access Public
 * @query  category?
 */
router.get('/', ctrl.listServices);

/**
 * @route  GET /api/services/:id
 * @desc   Get a single service
 * @access Public
 */
router.get('/:id', ctrl.getService);

/**
 * @route  POST /api/services
 * @desc   Create a new service (admin / shop expansion)
 * @access Private
 * @body   { category, name, durationMin, icon? }
 */
router.post('/', authenticate, ctrl.createService);

module.exports = router;
