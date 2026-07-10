// controllers/rideController.js
// Shared ride endpoints (get single ride, update status generically, full history)
// Role-specific actions (book/cancel for user; accept/start/complete for driver)
// live in userController.js and driverController.js respectively.

const Ride = require('../models/Ride');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// =========================================================
// @desc    Get a single ride by ID (accessible to the ride's user, driver, or admin)
// @route   GET /api/rides/:id
// @access  Private
// =========================================================
const getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('user', 'name phone email')
      .populate('driver', 'name phone vehicle rating currentLocation');

    if (!ride) return sendError(res, 404, 'Ride not found');

    const isOwner = ride.user._id.toString() === req.user._id.toString();
    const isDriver = ride.driver && ride.driver._id.toString() === req.user._id.toString();
    const isAdmin = req.role === 'admin';

    if (!isOwner && !isDriver && !isAdmin) {
      return sendError(res, 403, 'You are not authorized to view this ride');
    }

    return sendSuccess(res, 200, 'Ride fetched successfully', ride);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// =========================================================
// @desc    Generic ride status update (used internally / by admin)
// @route   PUT /api/rides/:id/status
// @access  Private (admin)
// =========================================================
const updateRideStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['requested', 'accepted', 'rejected', 'ongoing', 'completed', 'cancelled'];

    if (!allowedStatuses.includes(status)) {
      return sendError(res, 400, `Status must be one of: ${allowedStatuses.join(', ')}`);
    }

    const ride = await Ride.findById(req.params.id);
    if (!ride) return sendError(res, 404, 'Ride not found');

    ride.status = status;
    await ride.save();

    return sendSuccess(res, 200, 'Ride status updated successfully', ride);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// =========================================================
// @desc    Get live status of a specific ride (polling endpoint)
// @route   GET /api/rides/:id/live
// @access  Private
// =========================================================
const getLiveStatus = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .select('status driver pickupLocation dropLocation fare')
      .populate('driver', 'name phone vehicle currentLocation rating');

    if (!ride) return sendError(res, 404, 'Ride not found');

    return sendSuccess(res, 200, 'Live ride status fetched successfully', ride);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

module.exports = {
  getRideById,
  updateRideStatus,
  getLiveStatus,
};
