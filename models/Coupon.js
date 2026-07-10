// models/Coupon.js
// Schema for discount coupons

const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    discountType: {
      type: String,
      enum: ['flat', 'percentage'],
      default: 'flat',
    },
    discountValue: {
      type: Number,
      required: true,
    },
    maxDiscountAmount: {
      type: Number,
      default: null, // used only for percentage type
    },
    minFareRequired: {
      type: Number,
      default: 0,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      default: 1, // per user usage limit
    },
    usedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Coupon', couponSchema);
