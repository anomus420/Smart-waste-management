/**
 * middlewares/role.middleware.js
 * Restricts route access based on user role.
 * Must be used AFTER auth.middleware (protect).
 */
 
const { sendError } = require('../utils/helpers');
 
/**
 * @param {...string} roles - Allowed roles (e.g., 'admin', 'user')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required.', 401);
    }
 
    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Required role: [${roles.join(', ')}]. Your role: ${req.user.role}`,
        403
      );
    }
 
    next();
  };
};
 
// Convenience shortcuts
const adminOnly  = authorize('admin');
const userOrAdmin = authorize('user', 'admin');
 
module.exports = { authorize, adminOnly, userOrAdmin };