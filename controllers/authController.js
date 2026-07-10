// controllers/authController.js
// Handles registration & login for Users, Drivers, and Admin

const User = require('../models/User');
const Driver = require('../models/Driver');
const generateToken = require('../utils/generateToken');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { getMissingFields, isValidEmail, isValidPhone } = require('../utils/validators');

// =========================================================
// @desc    Register a new user (rider)
// @route   POST /api/auth/user/register
// @access  Public
// =========================================================
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const missing = getMissingFields(req.body, ['name', 'email', 'phone', 'password']);
    if (missing.length > 0) {
      return sendError(res, 400, `Missing required fields: ${missing.join(', ')}`);
    }
    if (!isValidEmail(email)) return sendError(res, 400, 'Invalid email format');
    if (!isValidPhone(phone)) return sendError(res, 400, 'Phone number must be 10 digits');
    if (password.length < 6) return sendError(res, 400, 'Password must be at least 6 characters');

    const userExists = await User.findOne({ $or: [{ email }, { phone }] });
    if (userExists) {
      return sendError(res, 400, 'A user with this email or phone already exists');
    }

    const user = await User.create({ name, email, phone, password });

    return sendSuccess(res, 201, 'User registered successfully', {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// =========================================================
// @desc    Login user
// @route   POST /api/auth/user/login
// @access  Public
// =========================================================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const missing = getMissingFields(req.body, ['email', 'password']);
    if (missing.length > 0) {
      return sendError(res, 400, `Missing required fields: ${missing.join(', ')}`);
    }

    const user = await User.findOne({ email, role: 'user' }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return sendError(res, 401, 'Invalid email or password');
    }

    if (user.isBlocked) {
      return sendError(res, 403, 'Your account has been blocked. Contact support.');
    }

    return sendSuccess(res, 200, 'Login successful', {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// =========================================================
// @desc    Register a new driver
// @route   POST /api/auth/driver/register
// @access  Public
// =========================================================
const registerDriver = async (req, res) => {
  try {
    const { name, email, phone, password, licenseNumber, vehicle } = req.body;

    const missing = getMissingFields(req.body, [
      'name', 'email', 'phone', 'password', 'licenseNumber', 'vehicle',
    ]);
    if (missing.length > 0) {
      return sendError(res, 400, `Missing required fields: ${missing.join(', ')}`);
    }
    if (!isValidEmail(email)) return sendError(res, 400, 'Invalid email format');
    if (!isValidPhone(phone)) return sendError(res, 400, 'Phone number must be 10 digits');

    // vehicle is expected as an object: { make, model, plateNumber, vehicleType }
    const parsedVehicle = typeof vehicle === 'string' ? JSON.parse(vehicle) : vehicle;
    if (!parsedVehicle?.make || !parsedVehicle?.model || !parsedVehicle?.plateNumber) {
      return sendError(res, 400, 'Vehicle make, model and plateNumber are required');
    }

    const driverExists = await Driver.findOne({
      $or: [{ email }, { phone }, { licenseNumber }, { 'vehicle.plateNumber': parsedVehicle.plateNumber }],
    });
    if (driverExists) {
      return sendError(res, 400, 'A driver with these details already exists');
    }

    // If files were uploaded via multer, attach their paths
    const documents = {};
    if (req.files) {
      if (req.files.licenseImage) documents.licenseImage = req.files.licenseImage[0].path;
      if (req.files.vehicleRC) documents.vehicleRC = req.files.vehicleRC[0].path;
      if (req.files.insurance) documents.insurance = req.files.insurance[0].path;
    }

    const driver = await Driver.create({
      name,
      email,
      phone,
      password,
      licenseNumber,
      vehicle: parsedVehicle,
      documents,
    });

    return sendSuccess(res, 201, 'Driver registered successfully. Awaiting admin approval.', {
      _id: driver._id,
      name: driver.name,
      email: driver.email,
      approvalStatus: driver.approvalStatus,
      token: generateToken(driver._id, driver.role),
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// =========================================================
// @desc    Login driver
// @route   POST /api/auth/driver/login
// @access  Public
// =========================================================
const loginDriver = async (req, res) => {
  try {
    const { email, password } = req.body;

    const missing = getMissingFields(req.body, ['email', 'password']);
    if (missing.length > 0) {
      return sendError(res, 400, `Missing required fields: ${missing.join(', ')}`);
    }

    const driver = await Driver.findOne({ email }).select('+password');
    if (!driver || !(await driver.matchPassword(password))) {
      return sendError(res, 401, 'Invalid email or password');
    }

    if (driver.isBlocked) {
      return sendError(res, 403, 'Your account has been blocked. Contact support.');
    }

    if (driver.approvalStatus !== 'approved') {
      return sendError(res, 403, `Your account is ${driver.approvalStatus}. Please wait for admin approval.`);
    }

    return sendSuccess(res, 200, 'Login successful', {
      _id: driver._id,
      name: driver.name,
      email: driver.email,
      role: driver.role,
      approvalStatus: driver.approvalStatus,
      token: generateToken(driver._id, driver.role),
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// =========================================================
// @desc    Login admin (admin accounts are User documents with role='admin')
// @route   POST /api/auth/admin/login
// @access  Public
// =========================================================
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const missing = getMissingFields(req.body, ['email', 'password']);
    if (missing.length > 0) {
      return sendError(res, 400, `Missing required fields: ${missing.join(', ')}`);
    }

    const admin = await User.findOne({ email, role: 'admin' }).select('+password');
    if (!admin || !(await admin.matchPassword(password))) {
      return sendError(res, 401, 'Invalid admin credentials');
    }

    return sendSuccess(res, 200, 'Admin login successful', {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      token: generateToken(admin._id, admin.role),
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

module.exports = {
  registerUser,
  loginUser,
  registerDriver,
  loginDriver,
  loginAdmin,
};
