// controllers/reviewController.js
// Handles ride reviews and driver rating aggregation

const Review = require('../models/Review');
const Ride = require('../models/Ride');
const Driver = require('../models/Driver');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { getMissingFields } = require('../utils/validators');

// =========================================================
// @desc    Create a review for a completed ride
// @route   POST /api/reviews
// @access  Private (user)
// =========================================================
const createReview = async (req, res) => {
  try {
    const { rideId, rating, comment } = req.body;

    const missing = getMissingFields(req.body, ['rideId', 'rating']);
    if (missing.length > 0) {
      return sendError(res, 400, `Missing required fields: ${missing.join(', ')}`);
    }
    if (rating < 1 || rating > 5) {
      return sendError(res, 400, 'Rating must be between 1 and 5');
    }

    const ride = await Ride.findById(rideId);
    if (!ride) return sendError(res, 404, 'Ride not found');
    if (ride.user.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'You can only review your own rides');
    }
    if (ride.status !== 'completed') {
      return sendError(res, 400, 'You can only review completed rides');
    }

    const existingReview = await Review.findOne({ ride: rideId });
    if (existingReview) return sendError(res, 400, 'This ride has already been reviewed');

    const review = await Review.create({
      ride: rideId,
      user: req.user._id,
      driver: ride.driver,
      rating,
      comment,
    });

    // Recalculate driver's average rating
    const driverReviews = await Review.find({ driver: ride.driver });
    const avgRating =
      driverReviews.reduce((sum, r) => sum + r.rating, 0) / driverReviews.length;

    await Driver.findByIdAndUpdate(ride.driver, {
      rating: Math.round(avgRating * 10) / 10,
    });

    return sendSuccess(res, 201, 'Review submitted successfully', review);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// =========================================================
// @desc    Get all reviews for a specific driver
// @route   GET /api/reviews/driver/:driverId
// @access  Public
// =========================================================
const getDriverReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ driver: req.params.driverId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Driver reviews fetched successfully', reviews);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

module.exports = {
  createReview,
  getDriverReviews,
};
