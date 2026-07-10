// middleware/authMiddleware.js
// Verifies JWT token and attaches the authenticated user/driver/admin to req

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Driver = require('../models/Driver');
const env = require('../config/env');
const { sendError } = require('../utils/apiResponse');

/**
 * Protects routes - requires a valid Bearer token in the Authorization header.
 * Populates req.user (could be a User, Driver, or Admin document) and req.role
 */
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 401, 'Not authorized, no token provided');
    }

    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET);

    let account;
    if (decoded.role === 'driver') {
      account = await Driver.findById(decoded.id);
    } else {
      // both 'user' and 'admin' roles are stored in the User collection
      account = await User.findById(decoded.id);
    }

    if (!account) {
      return sendError(res, 401, 'Not authorized, account not found');
    }

    if (account.isBlocked) {
      return sendError(res, 403, 'Your account has been blocked. Contact support.');
    }

    req.user = account;
    req.role = decoded.role;
    next();
  } catch (error) {
    return sendError(res, 401, 'Not authorized, token failed or expired');
  }
};

module.exports = { protect };
