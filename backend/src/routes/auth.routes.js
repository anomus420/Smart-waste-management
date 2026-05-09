/**
 * routes/auth.routes.js
 */
 
const router   = require('express').Router();
const passport = require('passport');
 
const {
  signup,
  login,
  getMe,
  googleCallback,
  changePassword,
} = require('../controllers/authController');
 
const { protect } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validator.middleware');
const { authLimiter } = require('../middlewares/rateLimiter');
const { signupValidator, loginValidator } = require('../utils/validator');
 
// ─── Local Auth ────────────────────────────────────────────────────────────────
router.post('/signup', authLimiter, signupValidator, validate, signup);
router.post('/login',  authLimiter, loginValidator,  validate, login);
router.get('/me',      protect, getMe);
router.put('/change-password', protect, changePassword);
 
// ─── Google OAuth ──────────────────────────────────────────────────────────────
// Step 1: Redirect user to Google consent screen
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);
 
// Step 2: Google redirects back here after consent
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_failed` }),
  googleCallback
);
 
module.exports = router;