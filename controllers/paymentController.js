// controllers/paymentController.js
// Simulates a payment gateway (dummy) since real gateway integration is out of scope

const Payment = require('../models/Payment');
const Ride = require('../models/Ride');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// =========================================================
// @desc    Process a dummy payment for a ride
// @route   POST /api/payments/pay
// @access  Private (user)
// =========================================================
const makePayment = async (req, res) => {
  try {
    const { rideId, method } = req.body;

    if (!rideId) return sendError(res, 400, 'rideId is required');

    const ride = await Ride.findById(rideId);
    if (!ride) return sendError(res, 404, 'Ride not found');
    if (ride.user.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'You are not authorized to pay for this ride');
    }
    if (ride.status !== 'completed') {
      return sendError(res, 400, 'Payment can only be made for completed rides');
    }

    let payment = await Payment.findOne({ ride: ride._id });

    // Simulate payment gateway processing (always succeeds in this dummy version)
    const simulatedSuccess = true;

    if (payment) {
      payment.status = simulatedSuccess ? 'success' : 'failed';
      payment.method = method || payment.method;
      await payment.save();
    } else {
      payment = await Payment.create({
        ride: ride._id,
        user: ride.user,
        driver: ride.driver,
        amount: ride.fare.final,
        method: method || ride.paymentMethod,
        status: simulatedSuccess ? 'success' : 'failed',
        transactionId: `TXN-${Date.now()}-${ride._id}`,
      });
    }

    if (simulatedSuccess) {
      ride.paymentStatus = 'paid';
      await ride.save();
    }

    return sendSuccess(res, 200, 'Payment processed successfully', payment);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// =========================================================
// @desc    Get logged-in user's / driver's payment history
// @route   GET /api/payments/history
// @access  Private (user, driver)
// =========================================================
const paymentHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const filter = req.role === 'driver' ? { driver: req.user._id } : { user: req.user._id };

    const payments = await Payment.find(filter)
      .populate('ride', 'pickupLocation dropLocation status createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Payment.countDocuments(filter);

    return sendSuccess(res, 200, 'Payment history fetched successfully', {
      payments,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// =========================================================
// @desc    Get a receipt for a specific payment
// @route   GET /api/payments/:id/receipt
// @access  Private
// =========================================================
const getReceipt = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('driver', 'name phone vehicle')
      .populate('ride', 'pickupLocation dropLocation distanceInKm fare createdAt completedAt');

    if (!payment) return sendError(res, 404, 'Payment not found');

    const isOwner = payment.user._id.toString() === req.user._id.toString();
    const isDriver = payment.driver._id.toString() === req.user._id.toString();
    const isAdmin = req.role === 'admin';

    if (!isOwner && !isDriver && !isAdmin) {
      return sendError(res, 403, 'You are not authorized to view this receipt');
    }

    // Construct a simple receipt object (in production this could generate a PDF)
    const receipt = {
      transactionId: payment.transactionId,
      status: payment.status,
      amount: payment.amount,
      method: payment.method,
      paidOn: payment.updatedAt,
      rider: payment.user.name,
      driver: payment.driver.name,
      vehicle: `${payment.driver.vehicle.make} ${payment.driver.vehicle.model} (${payment.driver.vehicle.plateNumber})`,
      pickup: payment.ride.pickupLocation.address,
      drop: payment.ride.dropLocation.address,
      distanceInKm: payment.ride.distanceInKm,
      fareBreakdown: payment.ride.fare,
    };

    return sendSuccess(res, 200, 'Receipt fetched successfully', receipt);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

module.exports = {
  makePayment,
  paymentHistory,
  getReceipt,
};
