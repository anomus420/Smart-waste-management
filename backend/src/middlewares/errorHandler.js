/**
 * middlewares/errorHandler.js
 * Centralized Express error handler. Must be registered LAST in app.js.
 */
 
const logger = require('../utils/logger');
 
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message    || 'Internal Server Error';
 
  // Log the full error in development
  if (process.env.NODE_ENV === 'development') {
    logger.error(`${req.method} ${req.originalUrl} → ${statusCode}: ${message}`);
    logger.error(err.stack);
  } else {
    // In production only log server errors
    if (statusCode >= 500) logger.error(err.stack);
  }
 
  // ─── Mongoose validation error ─────────────────────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 422;
    const fields = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(422).json({ success: false, message: 'Validation failed', errors: fields });
  }
 
  // ─── Mongoose CastError (bad ObjectId) ────────────────────────────────
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = `Invalid ID format: ${err.value}`;
  }
 
  // ─── MongoDB duplicate key ────────────────────────────────────────────
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
  }
 
  // ─── JWT errors ────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError')  { statusCode = 401; message = 'Invalid token.'; }
  if (err.name === 'TokenExpiredError')  { statusCode = 401; message = 'Token expired.'; }
 
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
 
module.exports = errorHandler;
 