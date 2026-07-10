// utils/generateToken.js
// Generates a signed JWT token containing user id and role

const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * @param {String} id - Mongo document _id
 * @param {String} role - 'user' | 'driver' | 'admin'
 * @returns {String} signed JWT
 */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = generateToken;
