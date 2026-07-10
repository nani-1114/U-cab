// controllers/adminController.js
// Handles admin dashboard stats and management of users, drivers, rides, payments

const User = require('../models/User');
const Driver = require('../models/Driver');
const Ride = require('../models/Ride');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// =========================================================
// @desc    Get dashboard summary statistics
// @route   GET /api/admin/dashboard
// @access  Private (admin)
// =========================================================
const getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalDrivers, totalRides, completedRides, cancelledRides, pendingDrivers] =
      await Promise.all([
        User.countDocuments({ role: 'user' }),
        Driver.countDocuments(),
        Ride.countDocuments(),
        Ride.countDocuments({ status: 'completed' }),
        Ride.countDocuments({ status: 'cancelled' }),
        Driver.countDocuments({ approvalStatus: 'pending' }),
      ]);

    const revenueAgg = await Payment.aggregate([
      { $match: { status: { $in: ['success', 'pending'] } } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
    ]);

    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    return sendSuccess(res, 200, 'Dashboard stats fetched successfully', {
      totalUsers,
      totalDrivers,
      totalRides,
      completedRides,
      cancelledRides,
      pendingDriverApprovals: pendingDrivers,
      totalRevenue,
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// =========================================================
// @desc    Get all users (with pagination + search)
// @route   GET /api/admin/users
// @access  Private (admin)
// =========================================================
const getAllUsers = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;

    const filter = {
      role: 'user',
      ...(search && {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }),
    };

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(filter);

    return sendSuccess(res, 200, 'Users fetched successfully', {
      users,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// =========================================================
// @desc    Block / Unblock a user
// @route   PUT /api/admin/users/:id/block
// @access  Private (admin)
// =========================================================
const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 404, 'User not found');

    user.isBlocked = !user.isBlocked;
    await user.save();

    return sendSuccess(res, 200, `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`, user);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// =========================================================
// @desc    Get all drivers (with pagination + filter by approval status)
// @route   GET /api/admin/drivers
// @access  Private (admin)
// =========================================================
const getAllDrivers = async (req, res) => {
  try {
    const { status, search = '', page = 1, limit = 10 } = req.query;

    const filter = {
      ...(status && { approvalStatus: status }),
      ...(search && {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }),
    };

    const drivers = await Driver.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Driver.countDocuments(filter);

    return sendSuccess(res, 200, 'Drivers fetched successfully', {
      drivers,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// =========================================================
// @desc    Approve or reject a driver's application
// @route   PUT /api/admin/drivers/:id/approve
// @access  Private (admin)
// =========================================================
const approveDriver = async (req, res) => {
  try {
    const { decision } = req.body; // 'approved' | 'rejected'

    if (!['approved', 'rejected'].includes(decision)) {
      return sendError(res, 400, "decision must be 'approved' or 'rejected'");
    }

    const driver = await Driver.findById(req.params.id);
    if (!driver) return sendError(res, 404, 'Driver not found');

    driver.approvalStatus = decision;
    await driver.save();

    await Notification.create({
      recipient: driver._id,
      recipientModel: 'Driver',
      title: `Application ${decision === 'approved' ? 'Approved' : 'Rejected'}`,
      message:
        decision === 'approved'
          ? 'Congratulations! Your driver application has been approved.'
          : 'Your driver application has been rejected. Contact support for details.',
      type: 'system',
    });

    return sendSuccess(res, 200, `Driver ${decision} successfully`, driver);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// =========================================================
// @desc    Block / Unblock a driver
// @route   PUT /api/admin/drivers/:id/block
// @access  Private (admin)
// =========================================================
const toggleBlockDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return sendError(res, 404, 'Driver not found');

    driver.isBlocked = !driver.isBlocked;
    if (driver.isBlocked) driver.isAvailable = false;
    await driver.save();

    return sendSuccess(res, 200, `Driver ${driver.isBlocked ? 'blocked' : 'unblocked'} successfully`, driver);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// =========================================================
// @desc    Get all rides (with filters)
// @route   GET /api/admin/rides
// @access  Private (admin)
// =========================================================
const getAllRides = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { ...(status && { status }) };

    const rides = await Ride.find(filter)
      .populate('user', 'name email phone')
      .populate('driver', 'name email phone vehicle')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Ride.countDocuments(filter);

    return sendSuccess(res, 200, 'Rides fetched successfully', {
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
// @desc    Force cancel a ride (admin intervention)
// @route   PUT /api/admin/rides/:id/cancel
// @access  Private (admin)
// =========================================================
const forceCancelRide = async (req, res) => {
  try {
    const { reason } = req.body;
    const ride = await Ride.findById(req.params.id);
    if (!ride) return sendError(res, 404, 'Ride not found');

    if (['completed', 'cancelled'].includes(ride.status)) {
      return sendError(res, 400, `Ride is already '${ride.status}'`);
    }

    ride.status = 'cancelled';
    ride.cancelledBy = 'admin';
    ride.cancellationReason = reason || 'Cancelled by admin';
    await ride.save();

    return sendSuccess(res, 200, 'Ride cancelled by admin successfully', ride);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// =========================================================
// @desc    Get all payments (with filters)
// @route   GET /api/admin/payments
// @access  Private (admin)
// =========================================================
const getAllPayments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { ...(status && { status }) };

    const payments = await Payment.find(filter)
      .populate('user', 'name email')
      .populate('driver', 'name email')
      .populate('ride', 'pickupLocation dropLocation status')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Payment.countDocuments(filter);

    return sendSuccess(res, 200, 'Payments fetched successfully', {
      payments,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

module.exports = {
  getDashboard,
  getAllUsers,
  toggleBlockUser,
  getAllDrivers,
  approveDriver,
  toggleBlockDriver,
  getAllRides,
  forceCancelRide,
  getAllPayments,
};
