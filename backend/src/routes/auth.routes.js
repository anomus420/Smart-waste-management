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
  forgotPassword,
  resetPassword,
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
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
 
// ─── Google OAuth ──────────────────────────────────────────────────────────────
// Step 1: Redirect user to Google consent screen
router.get('/google', (req, res, next) => {
  const returnTo = req.query.returnTo || req.query.from || req.headers.referer;
  let state = undefined;
  if (returnTo) {
    try {
      state = new URL(returnTo).origin;
    } catch {
      state = returnTo;
    }
  }
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    state,
  })(req, res, next);
});

// Step 2: Google redirects back here after consent
router.get(
  '/google/callback',
  (req, res, next) => {
    const fallbackUrl = req.query.state || (process.env.NODE_ENV === 'production' ? process.env.FRONTEND_PROD_URL : (process.env.FRONTEND_URL || 'http://localhost:5175'));
    passport.authenticate('google', {
      session: false,
      failureRedirect: `${fallbackUrl}/login?error=google_failed`,
    })(req, res, next);
  },
  googleCallback
);
 
module.exports = router;