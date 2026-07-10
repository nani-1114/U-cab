// utils/fareCalculator.js
// Utility to estimate ride fare based on distance, duration and vehicle type

const env = require('../config/env');

const VEHICLE_MULTIPLIER = {
  mini: 1,
  sedan: 1.3,
  suv: 1.6,
  bike: 0.6,
};

/**
 * Calculates estimated fare for a ride
 * @param {Number} distanceInKm
 * @param {Number} durationInMin
 * @param {String} vehicleType
 * @returns {Number} estimated fare rounded to 2 decimals
 */
const calculateFare = (distanceInKm, durationInMin = 0, vehicleType = 'mini') => {
  const baseFare = Number(env.BASE_FARE) || 50;
  const perKmRate = Number(env.PER_KM_RATE) || 12;
  const perMinRate = Number(env.PER_MIN_RATE) || 2;

  const multiplier = VEHICLE_MULTIPLIER[vehicleType] || 1;

  const fare =
    (baseFare + distanceInKm * perKmRate + durationInMin * perMinRate) *
    multiplier;

  return Math.round(fare * 100) / 100;
};

/**
 * Applies a coupon discount to a fare
 * @param {Number} fare
 * @param {Object} coupon - Coupon document
 * @returns {Object} { discountAmount, finalFare }
 */
const applyCouponDiscount = (fare, coupon) => {
  let discountAmount = 0;

  if (coupon.discountType === 'flat') {
    discountAmount = coupon.discountValue;
  } else if (coupon.discountType === 'percentage') {
    discountAmount = (fare * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
    }
  }

  discountAmount = Math.min(discountAmount, fare); // discount cannot exceed fare
  const finalFare = Math.round((fare - discountAmount) * 100) / 100;

  return { discountAmount: Math.round(discountAmount * 100) / 100, finalFare };
};

module.exports = { calculateFare, applyCouponDiscount };
