/**
 * middlewares/rateLimiter.js
 * Applies express-rate-limit to all /api/* routes.
 * Stricter limits on auth endpoints via authLimiter.
 */
 
const rateLimit = require('express-rate-limit');
 
// General API limiter
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
  skip: (req) => process.env.NODE_ENV === 'test', // skip in tests
});
 
// Stricter limiter for auth routes (prevent brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
});
 
// Upload limiter
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,
  message: {
    success: false,
    message: 'Upload limit reached. Please try again later.',
  },
});
 
module.exports = rateLimiter;
module.exports.authLimiter   = authLimiter;
module.exports.uploadLimiter = uploadLimiter;