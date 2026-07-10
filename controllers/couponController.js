// controllers/couponController.js
// Handles coupon creation (admin) and validation (user)

const Coupon = require('../models/Coupon');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { getMissingFields } = require('../utils/validators');

// =========================================================
// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Private (admin)
// =========================================================
const createCoupon = async (req, res) => {
  try {
    const { code, description, discountType, discountValue, maxDiscountAmount, minFareRequired, expiryDate, usageLimit } = req.body;

    const missing = getMissingFields(req.body, ['code', 'discountType', 'discountValue', 'expiryDate']);
    if (missing.length > 0) {
      return sendError(res, 400, `Missing required fields: ${missing.join(', ')}`);
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) return sendError(res, 400, 'Coupon code already exists');

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      maxDiscountAmount,
      minFareRequired,
      expiryDate,
      usageLimit,
    });

    return sendSuccess(res, 201, 'Coupon created successfully', coupon);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// =========================================================
// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private (admin)
// =========================================================
const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return sendSuccess(res, 200, 'Coupons fetched successfully', coupons);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// =========================================================
// @desc    Get all currently active coupons (for users to browse)
// @route   GET /api/coupons/active
// @access  Private (user)
// =========================================================
const getActiveCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      expiryDate: { $gte: new Date() },
    }).select('code description discountType discountValue minFareRequired expiryDate');

    return sendSuccess(res, 200, 'Active coupons fetched successfully', coupons);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// =========================================================
// @desc    Update a coupon
// @route   PUT /api/coupons/:id
// @access  Private (admin)
// =========================================================
const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return sendError(res, 404, 'Coupon not found');

    Object.assign(coupon, req.body);
    const updated = await coupon.save();

    return sendSuccess(res, 200, 'Coupon updated successfully', updated);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// =========================================================
// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private (admin)
// =========================================================
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return sendError(res, 404, 'Coupon not found');

    return sendSuccess(res, 200, 'Coupon deleted successfully', {});
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

module.exports = {
  createCoupon,
  getAllCoupons,
  getActiveCoupons,
  updateCoupon,
  deleteCoupon,
};
