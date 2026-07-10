const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const parseCorsOrigins = (value) =>
  (value || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

module.exports = {
  PORT: Number(process.env.PORT) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '',
  BASE_FARE: Number(process.env.BASE_FARE) || 50,
  PER_KM_RATE: Number(process.env.PER_KM_RATE) || 12,
  PER_MIN_RATE: Number(process.env.PER_MIN_RATE) || 2,
  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGIN || ''),
  isProduction: process.env.NODE_ENV === 'production',
};
