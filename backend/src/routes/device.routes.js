const router  = require('express').Router();
const { body } = require('express-validator');
const ctrl    = require('../controllers/deviceController');
const { authenticate, requireRole } = require('../middleware/auth');

const deviceRules = [
  body('name').notEmpty().withMessage('Device name is required'),
  body('deviceType')
    .isIn(['Smartphone','Tablet','Laptop','Desktop','Printer','Console','Other'])
    .withMessage('Invalid device type'),
  body('brand').notEmpty().withMessage('Brand is required'),
  body('model').notEmpty().withMessage('Model is required'),
];

// All device routes require login as customer
router.use(authenticate, requireRole('customer'));

/**
 * @route  GET /api/devices
 * @desc   List all devices registered by the logged-in customer
 * @access Private (customer)
 */
router.get('/', ctrl.listDevices);

/**
 * @route  GET /api/devices/:id
 * @desc   Get a single device
 * @access Private (customer — own device)
 */
router.get('/:id', ctrl.getDevice);

/**
 * @route  POST /api/devices
 * @desc   Register a new device
 * @access Private (customer)
 * @body   { name, deviceType, brand, model, serialNumber?, issueDesc? }
 */
router.post('/', deviceRules, ctrl.createDevice);

/**
 * @route  PUT /api/devices/:id
 * @desc   Update device info or status
 * @access Private (customer — own device)
 */
router.put('/:id', ctrl.updateDevice);

/**
 * @route  DELETE /api/devices/:id
 * @desc   Remove a device
 * @access Private (customer — own device)
 */
router.delete('/:id', ctrl.deleteDevice);

module.exports = router;
