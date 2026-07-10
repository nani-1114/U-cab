// routes/driverRoutes.js
// Protected routes for drivers

const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  updateAvailability,
  getRideRequests,
  acceptRide,
  rejectRide,
  startRide,
  completeRide,
  earningsHistory,
} = require('../controllers/driverController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// All routes below require a valid token and 'driver' role
router.use(protect, authorizeRoles('driver'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

router.put('/availability', updateAvailability);

router.get('/rides/requests', getRideRequests);
router.put('/rides/:id/accept', acceptRide);
router.put('/rides/:id/reject', rejectRide);
router.put('/rides/:id/start', startRide);
router.put('/rides/:id/complete', completeRide);

router.get('/earnings', earningsHistory);

module.exports = router;
