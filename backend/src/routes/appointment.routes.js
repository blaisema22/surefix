const router  = require('express').Router();
const { body } = require('express-validator');
const ctrl    = require('../controllers/appointmentController');
const { authenticate, requireRole } = require('../middleware/auth');

const bookingRules = [
  body('shopId').notEmpty().withMessage('shopId is required'),
  body('deviceId').notEmpty().withMessage('deviceId is required'),
  body('serviceId').notEmpty().withMessage('serviceId is required'),
  body('appointmentDate').isDate().withMessage('Valid appointmentDate (YYYY-MM-DD) required'),
  body('appointmentTime').matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('Valid appointmentTime (HH:MM) required'),
];

// All appointment routes require authentication
router.use(authenticate);

/**
 * @route  GET /api/appointments
 * @desc   List appointments
 *           - Customer: own appointments
 *           - Shop: all bookings at their centre
 * @access Private
 * @query  status?, date?
 */
router.get('/', ctrl.listAppointments);

/**
 * @route  GET /api/appointments/:id
 * @desc   Get a single appointment (must belong to user or their shop)
 * @access Private
 */
router.get('/:id', ctrl.getAppointment);

/**
 * @route  POST /api/appointments
 * @desc   Book a new repair appointment
 * @access Private (customer only)
 * @body   { shopId, deviceId, serviceId, appointmentDate, appointmentTime, customerNote? }
 */
router.post('/', requireRole('customer'), bookingRules, ctrl.createAppointment);

/**
 * @route  PATCH /api/appointments/:id/status
 * @desc   Shop updates appointment status (confirmed → in_progress → completed)
 * @access Private (shop only)
 * @body   { status, technicianNote? }
 */
router.patch('/:id/status', requireRole('shop'), ctrl.updateStatus);

/**
 * @route  DELETE /api/appointments/:id
 * @desc   Customer cancels an appointment
 * @access Private (customer only)
 */
router.delete('/:id', requireRole('customer'), ctrl.cancelAppointment);

module.exports = router;
