const router = require('express').Router();
const ctrl   = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

/**
 * @route  GET /api/notifications
 * @desc   Get own notifications + unread count
 * @access Private
 */
router.get('/', ctrl.listNotifications);

/**
 * @route  PATCH /api/notifications/read-all
 * @desc   Mark all notifications as read
 * @access Private
 */
router.patch('/read-all', ctrl.markAllRead);

/**
 * @route  PATCH /api/notifications/:id/read
 * @desc   Mark a single notification as read
 * @access Private
 */
router.patch('/:id/read', ctrl.markRead);

module.exports = router;
