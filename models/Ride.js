// models/Ride.js
// Schema for ride bookings

const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false }
);

const rideSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      default: null,
    },
    pickupLocation: {
      type: locationSchema,
      required: true,
    },
    dropLocation: {
      type: locationSchema,
      required: true,
    },
    distanceInKm: {
      type: Number,
      required: true,
    },
    estimatedDurationInMin: {
      type: Number,
      default: 0,
    },
    vehicleType: {
      type: String,
      enum: ['mini', 'sedan', 'suv', 'bike'],
      default: 'mini',
    },
    fare: {
      estimated: { type: Number, required: true },
      final: { type: Number, default: 0 },
    },
    couponApplied: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
      default: null,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    donationAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: [
        'requested',   // user booked, awaiting driver acceptance
        'accepted',    // driver accepted
        'rejected',    // driver rejected
        'ongoing',     // ride started
        'completed',   // ride finished
        'cancelled',   // cancelled by user/driver/admin
      ],
      default: 'requested',
    },
    cancelledBy: {
      type: String,
      enum: ['user', 'driver', 'admin', null],
      default: null,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'wallet'],
      default: 'cash',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ride', rideSchema);
