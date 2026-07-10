// config/db.js
// Handles MongoDB connection using Mongoose

const mongoose = require('mongoose');
const env = require('./env');

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined. Set it in your environment variables.');
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(env.MONGO_URI, {
      bufferCommands: false, // Disable Mongoose buffering
    }).then((mongoose) => {
      console.log(`MongoDB Connected: ${mongoose.connection.host}`);
      return mongoose;
    }).catch(err => {
      console.error(`MongoDB Connection Error: ${err.message}`);
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};

module.exports = connectDB;
