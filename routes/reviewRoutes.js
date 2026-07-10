// routes/reviewRoutes.js
// Ride reviews and driver ratings

const express = require('express');
const router = express.Router();
const { createReview, getDriverReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Public - anyone can view a driver's reviews (e.g. shown before booking)
router.get('/driver/:driverId', getDriverReviews);

// Private - only a user can submit a review
router.post('/', protect, authorizeRoles('user'), createReview);

module.exports = router;
