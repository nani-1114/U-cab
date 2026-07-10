// middleware/roleMiddleware.js
// Restricts route access to specific roles. Must be used AFTER `protect`.

const { sendError } = require('../utils/apiResponse');

/**
 * @param  {...String} roles - allowed roles e.g. authorizeRoles('admin', 'driver')
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.role || !roles.includes(req.role)) {
      return sendError(
        res,
        403,
        `Access denied. Role '${req.role || 'unknown'}' is not authorized for this route.`
      );
    }
    next();
  };
};

module.exports = { authorizeRoles };
