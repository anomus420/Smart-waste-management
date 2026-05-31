/**
 * controllers/authController.js
 * Handles signup, login, profile fetch, and Google OAuth callback.
 */
 
const User        = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { sendSuccess, sendError } = require('../utils/helpers');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../services/emailService');
const logger      = require('../utils/logger');
const crypto      = require('crypto');
 
// ─── Build token + user payload ────────────────────────────────────────────────
const buildAuthResponse = (user) => ({
  token: generateToken({ id: user._id, role: user.role }),
  user: {
    _id:    user._id,
    name:   user.name,
    email:  user.email,
    role:   user.role,
    avatar: user.avatar,
    phone:  user.phone,
    address: user.address,
    ecoPoints: user.ecoPoints,
    createdAt: user.createdAt,
  },
});
 
// ─── POST /api/auth/signup ─────────────────────────────────────────────────────
const signup = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
 
    const existing = await User.findOne({ email });
    if (existing) {
      return sendError(res, 'An account with this email already exists.', 409);
    }
 
    const user = await User.create({ name, email, password, phone });
 
    // Non-blocking welcome email
    sendWelcomeEmail(user).catch(() => {});
 
    logger.info(`New user registered: ${email}`);
    return sendSuccess(res, buildAuthResponse(user), 'Account created successfully.', 201);
  } catch (error) {
    next(error);
  }
};
 
// ─── POST /api/auth/login ──────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
 
    // Select password explicitly (it's hidden by default)
    const user = await User.findOne({ email }).select('+password');
 
    if (!user || !(await user.comparePassword(password))) {
      return sendError(res, 'Invalid email or password.', 401);
    }
 
    if (user.isBlocked) {
      return sendError(res, 'Your account has been suspended. Contact support.', 403);
    }
 
    if (!user.googleId && !user.password) {
      return sendError(res, 'This account uses Google Sign-In. Please use that option.', 400);
    }
 
    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
 
    logger.info(`User logged in: ${email}`);
    return sendSuccess(res, buildAuthResponse(user), 'Login successful.');
  } catch (error) {
    next(error);
  }
};
 
// ─── GET /api/auth/me ──────────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return sendError(res, 'User not found.', 404);
 
    return sendSuccess(res, { user: user.toPublicJSON() });
  } catch (error) {
    next(error);
  }
};
 
// ─── GET /api/auth/google/callback – handled by Passport ──────────────────────
// After Passport authenticates, this controller issues a JWT and redirects.
const googleCallback = async (req, res) => {
  try {
    const { token, user } = buildAuthResponse(req.user);
 
    const frontendUrl = process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_PROD_URL 
      : process.env.FRONTEND_URL || 'http://localhost:5173';

    // Redirect to frontend with token in query (frontend stores it)
    const redirectUrl = `${frontendUrl}/auth/google/success?token=${token}&userId=${user._id}`;
    res.redirect(redirectUrl);
  } catch (error) {
    const frontendUrl = process.env.NODE_ENV === 'production' ? process.env.FRONTEND_PROD_URL : process.env.FRONTEND_URL;
    res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
  }
};
 
// ─── PUT /api/auth/change-password ────────────────────────────────────────────
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
 
    const user = await User.findById(req.user._id).select('+password');
 
    if (!user.password) {
      return sendError(res, 'Password change is not available for Google OAuth accounts.', 400);
    }
 
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return sendError(res, 'Current password is incorrect.', 400);
    }
 
    user.password = newPassword;
    await user.save();
 
    return sendSuccess(res, {}, 'Password updated successfully.');
  } catch (error) {
    next(error);
  }
};
 
// ─── POST /api/auth/forgot-password ───────────────────────────────────────────
const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return sendError(res, 'There is no user with that email.', 404);
    }
    if (user.googleId && !user.password) {
      return sendError(res, 'This account uses Google Sign-In. Password reset is not applicable.', 400);
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset url
    const frontendUrl = process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_PROD_URL 
      : process.env.FRONTEND_URL || 'http://localhost:5173';
    
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    // Log to console for development testing if SMTP fails
    logger.info(`Password reset URL for ${user.email}: ${resetUrl}`);

    try {
      await sendPasswordResetEmail(user, resetUrl);
      return sendSuccess(res, {}, 'Email sent successfully.');
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return sendError(res, 'Email could not be sent. Please try again later.', 500);
    }
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/auth/reset-password/:token ──────────────────────────────────────
const resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select('+password');

    if (!user) {
      return sendError(res, 'Invalid or expired token.', 400);
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    logger.info(`User reset password: ${user.email}`);
    return sendSuccess(res, buildAuthResponse(user), 'Password reset successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, login, getMe, googleCallback, changePassword, forgotPassword, resetPassword };