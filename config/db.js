// config/db.js
// Handles MongoDB connection using Mongoose

const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
  if (!env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined. Set it in your environment variables.');
  }

  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      autoIndex: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
