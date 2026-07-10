// routes/userRoutes.js
// Protected routes for regular users (riders)

const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  estimateFare,
  bookRide,
  cancelRide,
  bookingHistory,
  getLiveRide,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// All routes below require a valid token and 'user' role
router.use(protect, authorizeRoles('user'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

router.post('/fare-estimate', estimateFare);

router.post('/rides/book', bookRide);
router.put('/rides/:id/cancel', cancelRide);
router.get('/rides/history', bookingHistory);
router.get('/rides/live', getLiveRide);

module.exports = router;
