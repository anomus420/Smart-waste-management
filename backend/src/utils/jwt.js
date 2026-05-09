/**
 * utils/jwt.js – JWT token generation and verification helpers
 */
 
const jwt = require('jsonwebtoken');
 
/**
 * Generate a signed JWT for a user.
 * @param {Object} payload - Data to encode (typically { id, role })
 * @returns {string} Signed JWT string
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};
 
/**
 * Verify and decode a JWT.
 * @param {string} token
 * @returns {Object} Decoded payload
 * @throws Will throw if token is invalid or expired
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
 
/**
 * Extract token from Authorization header (Bearer <token>).
 * @param {Object} req - Express request
 * @returns {string|null}
 */
const extractToken = (req) => {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    return auth.split(' ')[1];
  }
  return null;
};
 
module.exports = { generateToken, verifyToken, extractToken };