// models/Driver.js
// Schema for drivers (cab operators)

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['driver'],
      default: 'driver',
    },
    licenseNumber: {
      type: String,
      required: [true, 'License number is required'],
      unique: true,
    },
    vehicle: {
      make: { type: String, required: true },
      model: { type: String, required: true },
      plateNumber: { type: String, required: true, unique: true },
      vehicleType: {
        type: String,
        enum: ['mini', 'sedan', 'suv', 'bike'],
        default: 'mini',
      },
    },
    documents: {
      licenseImage: { type: String, default: '' },
      vehicleRC: { type: String, default: '' },
      insurance: { type: String, default: '' },
    },
    // Admin must approve a driver before they can go online / accept rides
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    isAvailable: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    currentLocation: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
    rating: {
      type: Number,
      default: 5,
      min: 0,
      max: 5,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    totalRides: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

driverSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

driverSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Driver', driverSchema);
