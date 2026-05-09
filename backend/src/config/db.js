/**
 * config/db.js – MongoDB connection using Mongoose
 */
 
const mongoose = require('mongoose');
const logger = require('../utils/logger');
 
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Mongoose 8 uses these defaults — kept explicit for clarity
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
 
    logger.info(`✅ MongoDB connected: ${conn.connection.host}`);
 
    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed (app termination)');
      process.exit(0);
    });
 
    return conn;
  } catch (error) {
    logger.error(`❌ MongoDB connection failed: ${error.message}`);
    throw error;
  }
};
 
module.exports = connectDB;