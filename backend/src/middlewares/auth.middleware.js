/**
 * middlewares/auth.middleware.js
 * Verifies JWT and attaches the decoded user to req.user.
 */
 
const { verifyToken, extractToken } = require('../utils/jwt');
const User = require('../models/User');
const { sendError } = require('../utils/helpers');
const logger = require('../utils/logger');
 
const protect = async (req, res, next) => {
  try {
    const token = extractToken(req);
 
    if (!token) {
      return sendError(res, 'Access denied. No token provided.', 401);
    }
 
    // Decode token
    const decoded = verifyToken(token);
 
    // Fetch user from DB (ensures user still exists & not blocked)
    const user = await User.findById(decoded.id).select('-password');
 
    if (!user) {
      return sendError(res, 'User not found. Token may be stale.', 401);
    }
 
    if (user.isBlocked) {
      return sendError(res, 'Your account has been blocked. Contact support.', 403);
    }
 
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    logger.warn('Auth middleware error:', error.message);
 
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Token expired. Please log in again.', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 'Invalid token.', 401);
    }
 
    return sendError(res, 'Authentication failed.', 401);
  }
};
 
module.exports = { protect };