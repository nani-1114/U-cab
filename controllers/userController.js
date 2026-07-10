// controllers/userController.js
// Handles user profile management and user-facing ride actions

const User = require('../models/User');
const Ride = require('../models/Ride');
const Coupon = require('../models/Coupon');
const Notification = require('../models/Notification');
const { calculateFare, applyCouponDiscount } = require('../utils/fareCalculator');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { getMissingFields } = require('../utils/validators');

// =========================================================
// @desc    Get logged-in user's profile
// @route   GET /api/users/profile
// @access  Private (user)
// =========================================================
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return sendError(res, 404, 'User not found');
    return sendSuccess(res, 200, 'Profile fetched successfully', user);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// =========================================================
// @desc    Update logged-in user's profile
// @route   PUT /api/users/profile
// @access  Private (user)
// =========================================================
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return sendError(res, 404, 'User not found');

    const { name, address, profilePicture } = req.body;

    if (name) user.name = name;
    if (address) user.address = address;
    if (profilePicture) user.profilePicture = profilePicture;
    // Note: email/phone changes typically require re-verification; omitted here by design

    const updatedUser = await user.save();

    return sendSuccess(res, 200, 'Profile updated successfully', updatedUser);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// =========================================================
// @desc    Estimate fare for a potential ride (before booking)
// @route   POST /api/users/fare-estimate
// @access  Private (user)
// =========================================================
const estimateFare = async (req, res) => {
  try {
    const { distanceInKm, estimatedDurationInMin, vehicleType } = req.body;

    const missing = getMissingFields(req.body, ['distanceInKm']);
    if (missing.length > 0) {
      return sendError(res, 400, `Missing required fields: ${missing.join(', ')}`);
    }
    if (isNaN(distanceInKm) || Number(distanceInKm) <= 0) {
      return sendError(res, 400, 'distanceInKm must be a positive number');
    }

    const fare = calculateFare(
      Number(distanceInKm),
      Number(estimatedDurationInMin) || 0,
      vehicleType || 'mini'
    );

    return sendSuccess(res, 200, 'Fare estimated successfully', {
      distanceInKm: Number(distanceInKm),
      estimatedDurationInMin: Number(estimatedDurationInMin) || 0,
      vehicleType: vehicleType || 'mini',
      estimatedFare: fare,
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// =========================================================
// @desc    Book a new ride
// @route   POST /api/users/rides/book
// @access  Private (user)
// =========================================================
const bookRide = async (req, res) => {
  try {
    const {
      pickupLocation,
      dropLocation,
      distanceInKm,
      estimatedDurationInMin,
      vehicleType,
      paymentMethod,
      couponCode,
      donationAmount,
    } = req.body;

    const missing = getMissingFields(req.body, [
      'pickupLocation', 'dropLocation', 'distanceInKm',
    ]);
    if (missing.length > 0) {
      return sendError(res, 400, `Missing required fields: ${missing.join(', ')}`);
    }

    // Check if user already has an active ride
    const activeRide = await Ride.findOne({
      user: req.user._id,
      status: { $in: ['requested', 'accepted', 'ongoing'] },
    });
    if (activeRide) {
      return sendError(res, 400, 'You already have an active ride. Complete or cancel it first.');
    }

    const estimatedFare = calculateFare(
      Number(distanceInKm),
      Number(estimatedDurationInMin) || 0,
      vehicleType || 'mini'
    );

    let discountAmount = 0;
    let finalFare = estimatedFare;
    let coupon = null;

    // Apply coupon if provided
    if (couponCode) {
      coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (!coupon) return sendError(res, 400, 'Invalid or inactive coupon code');
      if (coupon.expiryDate < new Date()) return sendError(res, 400, 'Coupon has expired');
      if (estimatedFare < coupon.minFareRequired) {
        return sendError(res, 400, `Minimum fare of ${coupon.minFareRequired} required for this coupon`);
      }
      const usageCount = coupon.usedBy.filter((id) => id.toString() === req.user._id.toString()).length;
      if (usageCount >= coupon.usageLimit) {
        return sendError(res, 400, 'Coupon usage limit reached for your account');
      }

      const discountResult = applyCouponDiscount(estimatedFare, coupon);
      discountAmount = discountResult.discountAmount;
      finalFare = discountResult.finalFare;
    }

    // Add optional donation on top of fare (charity round-up feature)
    const donation = Number(donationAmount) || 0;

    const ride = await Ride.create({
      user: req.user._id,
      pickupLocation,
      dropLocation,
      distanceInKm: Number(distanceInKm),
      estimatedDurationInMin: Number(estimatedDurationInMin) || 0,
      vehicleType: vehicleType || 'mini',
      fare: { estimated: finalFare + donation, final: 0 },
      couponApplied: coupon ? coupon._id : null,
      discountAmount,
      donationAmount: donation,
      paymentMethod: paymentMethod || 'cash',
    });

    // Mark coupon as used by this user
    if (coupon) {
      coupon.usedBy.push(req.user._id);
      await coupon.save();
    }

    return sendSuccess(res, 201, 'Ride booked successfully. Searching for a driver...', ride);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// =========================================================
// @desc    Cancel a ride
// @route   PUT /api/users/rides/:id/cancel
// @access  Private (user)
// =========================================================
const cancelRide = async (req, res) => {
  try {
    const { reason } = req.body;
    const ride = await Ride.findById(req.params.id);

    if (!ride) return sendError(res, 404, 'Ride not found');
    if (ride.user.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'You are not authorized to cancel this ride');
    }
    if (['completed', 'cancelled', 'rejected'].includes(ride.status)) {
      return sendError(res, 400, `Ride cannot be cancelled as it is already '${ride.status}'`);
    }

    ride.status = 'cancelled';
    ride.cancelledBy = 'user';
    ride.cancellationReason = reason || 'No reason provided';
    await ride.save();

    // Notify driver if one was already assigned
    if (ride.driver) {
      await Notification.create({
        recipient: ride.driver,
        recipientModel: 'Driver',
        title: 'Ride Cancelled',
        message: `The rider has cancelled ride #${ride._id}.`,
        type: 'ride',
      });
    }

    return sendSuccess(res, 200, 'Ride cancelled successfully', ride);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// =========================================================
// @desc    Get user's ride booking history
// @route   GET /api/users/rides/history
// @access  Private (user)
// =========================================================
const bookingHistory = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const rides = await Ride.find(filter)
      .populate('driver', 'name phone vehicle rating')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Ride.countDocuments(filter);

    return sendSuccess(res, 200, 'Booking history fetched successfully', {
      rides,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// =========================================================
// @desc    Get live status of user's current active ride
// @route   GET /api/users/rides/live
// @access  Private (user)
// =========================================================
const getLiveRide = async (req, res) => {
  try {
    const ride = await Ride.findOne({
      user: req.user._id,
      status: { $in: ['requested', 'accepted', 'ongoing'] },
    }).populate('driver', 'name phone vehicle currentLocation rating');

    if (!ride) return sendError(res, 404, 'No active ride found');

    return sendSuccess(res, 200, 'Live ride status fetched successfully', ride);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  estimateFare,
  bookRide,
  cancelRide,
  bookingHistory,
  getLiveRide,
};
