// controllers/driverController.js
// Handles driver profile, availability, and ride lifecycle actions

const Driver = require('../models/Driver');
const Ride = require('../models/Ride');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// =========================================================
// @desc    Get logged-in driver's profile
// @route   GET /api/drivers/profile
// @access  Private (driver)
// =========================================================
const getProfile = async (req, res) => {
  try {
    const driver = await Driver.findById(req.user._id);
    if (!driver) return sendError(res, 404, 'Driver not found');
    return sendSuccess(res, 200, 'Profile fetched successfully', driver);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// =========================================================
// @desc    Update driver profile
// @route   PUT /api/drivers/profile
// @access  Private (driver)
// =========================================================
const updateProfile = async (req, res) => {
  try {
    const driver = await Driver.findById(req.user._id);
    if (!driver) return sendError(res, 404, 'Driver not found');

    const { name, vehicle, currentLocation } = req.body;

    if (name) driver.name = name;
    if (vehicle) driver.vehicle = { ...driver.vehicle.toObject(), ...vehicle };
    if (currentLocation) driver.currentLocation = currentLocation;

    const updated = await driver.save();
    return sendSuccess(res, 200, 'Profile updated successfully', updated);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// =========================================================
// @desc    Toggle / set driver availability (online / offline)
// @route   PUT /api/drivers/availability
// @access  Private (driver)
// =========================================================
const updateAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;

    const driver = await Driver.findById(req.user._id);
    if (!driver) return sendError(res, 404, 'Driver not found');

    if (driver.approvalStatus !== 'approved') {
      return sendError(res, 403, 'Your account is not yet approved by admin');
    }

    driver.isAvailable = typeof isAvailable === 'boolean' ? isAvailable : !driver.isAvailable;
    await driver.save();

    return sendSuccess(res, 200, `You are now ${driver.isAvailable ? 'online' : 'offline'}`, {
      isAvailable: driver.isAvailable,
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// =========================================================
// @desc    Get list of ride requests available to accept (unassigned, requested)
// @route   GET /api/drivers/rides/requests
// @access  Private (driver)
// =========================================================
const getRideRequests = async (req, res) => {
  try {
    const driver = await Driver.findById(req.user._id);
    if (!driver.isAvailable) {
      return sendError(res, 400, 'You must be online to view ride requests');
    }

    const rides = await Ride.find({
      status: 'requested',
      driver: null,
      vehicleType: driver.vehicle.vehicleType,
    })
      .populate('user', 'name phone')
      .sort({ createdAt: 1 });

    return sendSuccess(res, 200, 'Ride requests fetched successfully', rides);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// =========================================================
// @desc    Accept a ride request
// @route   PUT /api/drivers/rides/:id/accept
// @access  Private (driver)
// =========================================================
const acceptRide = async (req, res) => {
  try {
    const driver = await Driver.findById(req.user._id);
    if (!driver.isAvailable) {
      return sendError(res, 400, 'You must be online to accept rides');
    }

    const ride = await Ride.findById(req.params.id);
    if (!ride) return sendError(res, 404, 'Ride not found');
    if (ride.status !== 'requested' || ride.driver) {
      return sendError(res, 400, 'This ride is no longer available');
    }

    // Ensure driver has no other active ride
    const activeRide = await Ride.findOne({
      driver: driver._id,
      status: { $in: ['accepted', 'ongoing'] },
    });
    if (activeRide) {
      return sendError(res, 400, 'You already have an active ride');
    }

    ride.driver = driver._id;
    ride.status = 'accepted';
    await ride.save();

    driver.isAvailable = false; // driver busy with a ride now
    await driver.save();

    await Notification.create({
      recipient: ride.user,
      recipientModel: 'User',
      title: 'Ride Accepted',
      message: `Driver ${driver.name} has accepted your ride request.`,
      type: 'ride',
    });

    return sendSuccess(res, 200, 'Ride accepted successfully', ride);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// =========================================================
// @desc    Reject a ride request
// @route   PUT /api/drivers/rides/:id/reject
// @access  Private (driver)
// =========================================================
const rejectRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return sendError(res, 404, 'Ride not found');
    if (ride.status !== 'requested') {
      return sendError(res, 400, 'This ride cannot be rejected at this stage');
    }

    // Rejecting simply means this driver opts out; ride stays open for others
    // unless business logic dictates otherwise. Here we just notify + log.
    await Notification.create({
      recipient: ride.user,
      recipientModel: 'User',
      title: 'Driver Unavailable',
      message: 'A driver rejected your ride request. Searching for another driver...',
      type: 'ride',
    });

    return sendSuccess(res, 200, 'Ride rejected. It remains open for other drivers.', ride);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// =========================================================
// @desc    Start an accepted ride
// @route   PUT /api/drivers/rides/:id/start
// @access  Private (driver)
// =========================================================
const startRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return sendError(res, 404, 'Ride not found');
    if (ride.driver.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'You are not assigned to this ride');
    }
    if (ride.status !== 'accepted') {
      return sendError(res, 400, `Ride cannot be started from status '${ride.status}'`);
    }

    ride.status = 'ongoing';
    ride.startedAt = new Date();
    await ride.save();

    await Notification.create({
      recipient: ride.user,
      recipientModel: 'User',
      title: 'Ride Started',
      message: 'Your ride has started. Enjoy your trip!',
      type: 'ride',
    });

    return sendSuccess(res, 200, 'Ride started successfully', ride);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// =========================================================
// @desc    Complete an ongoing ride
// @route   PUT /api/drivers/rides/:id/complete
// @access  Private (driver)
// =========================================================
const completeRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return sendError(res, 404, 'Ride not found');
    if (ride.driver.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'You are not assigned to this ride');
    }
    if (ride.status !== 'ongoing') {
      return sendError(res, 400, `Ride cannot be completed from status '${ride.status}'`);
    }

    ride.status = 'completed';
    ride.completedAt = new Date();
    ride.fare.final = ride.fare.estimated; // in production, recalc based on actual distance/time
    ride.paymentStatus = ride.paymentMethod === 'cash' ? 'pending' : 'paid';
    await ride.save();

    // Update driver stats
    const driver = await Driver.findById(req.user._id);
    driver.isAvailable = true;
    driver.totalRides += 1;
    driver.totalEarnings += ride.fare.final;
    await driver.save();

    // Create a payment record
    await Payment.create({
      ride: ride._id,
      user: ride.user,
      driver: driver._id,
      amount: ride.fare.final,
      method: ride.paymentMethod,
      status: ride.paymentMethod === 'cash' ? 'pending' : 'success',
      transactionId: `TXN-${Date.now()}-${ride._id}`,
    });

    await Notification.create({
      recipient: ride.user,
      recipientModel: 'User',
      title: 'Ride Completed',
      message: `Your ride is complete. Total fare: ${ride.fare.final}`,
      type: 'ride',
    });

    return sendSuccess(res, 200, 'Ride completed successfully', ride);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// =========================================================
// @desc    Get driver's earnings history
// @route   GET /api/drivers/earnings
// @access  Private (driver)
// =========================================================
const earningsHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const rides = await Ride.find({ driver: req.user._id, status: 'completed' })
      .select('fare distanceInKm createdAt completedAt user')
      .populate('user', 'name')
      .sort({ completedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Ride.countDocuments({ driver: req.user._id, status: 'completed' });
    const totalEarnings = rides.reduce((sum, r) => sum + r.fare.final, 0);

    return sendSuccess(res, 200, 'Earnings history fetched successfully', {
      rides,
      total,
      totalEarnings,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateAvailability,
  getRideRequests,
  acceptRide,
  rejectRide,
  startRide,
  completeRide,
  earningsHistory,
};
