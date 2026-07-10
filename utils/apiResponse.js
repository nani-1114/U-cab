// utils/apiResponse.js
// Reusable helper functions to keep API responses consistent across the app

/**
 * Sends a successful response
 * @param {Object} res - Express response object
 * @param {Number} statusCode
 * @param {String} message
 * @param {Object|Array} data
 */
const sendSuccess = (res, statusCode = 200, message = 'Success', data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Sends an error response
 * @param {Object} res - Express response object
 * @param {Number} statusCode
 * @param {String} message
 */
const sendError = (res, statusCode = 500, message = 'Something went wrong') => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = { sendSuccess, sendError };
