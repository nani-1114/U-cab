// utils/validators.js
// Simple reusable field validators (kept dependency-light; can be swapped
// for express-validator chains if preferred)

/**
 * Validates presence of required fields in a request body
 * @param {Object} body - req.body
 * @param {Array<String>} fields - list of required field names
 * @returns {Array<String>} list of missing field names (empty if all present)
 */
const getMissingFields = (body, fields) => {
  return fields.filter(
    (field) => body[field] === undefined || body[field] === null || body[field] === ''
  );
};

const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

const isValidPhone = (phone) => /^[0-9]{10}$/.test(phone);

module.exports = { getMissingFields, isValidEmail, isValidPhone };
