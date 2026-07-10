// server.js
// Entry point for the Ucab backend server

const env = require('./config/env');
const connectDB = require('./config/db');
const app = require('./app');

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(env.PORT, () => {
      console.log(`Ucab server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });

    const shutdown = (signal) => {
      console.log(`Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
