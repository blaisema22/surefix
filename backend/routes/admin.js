const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

router.use(authenticate);
router.use(authorize('admin'));

router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getAllUsers);
router.put('/users/:id', adminController.updateUser);
router.get('/reports/sales', adminController.getSalesReport);
router.get('/reports/appointments', adminController.getAppointmentsReport);

module.exports = router;