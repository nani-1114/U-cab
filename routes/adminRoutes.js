// routes/adminRoutes.js
// Protected routes for admin dashboard and management

const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getAllUsers,
  toggleBlockUser,
  getAllDrivers,
  approveDriver,
  toggleBlockDriver,
  getAllRides,
  forceCancelRide,
  getAllPayments,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// All routes below require a valid token and 'admin' role
router.use(protect, authorizeRoles('admin'));

router.get('/dashboard', getDashboard);

router.get('/users', getAllUsers);
router.put('/users/:id/block', toggleBlockUser);

router.get('/drivers', getAllDrivers);
router.put('/drivers/:id/approve', approveDriver);
router.put('/drivers/:id/block', toggleBlockDriver);

router.get('/rides', getAllRides);
router.put('/rides/:id/cancel', forceCancelRide);

router.get('/payments', getAllPayments);

module.exports = router;
