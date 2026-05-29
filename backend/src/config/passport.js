/**
 * config/passport.js – Google OAuth 2.0 strategy
 */
 
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const logger = require('../utils/logger');
 
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // If GOOGLE_CALLBACK_URL is missing, default to a relative path which passport will resolve.
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
      // Required for Render/Heroku deployments so passport resolves relative URLs to HTTPS
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        let user = await User.findOne({ googleId: profile.id });
 
        if (user) {
          return done(null, user);
        }
 
        // Check if email already registered (merge accounts)
        user = await User.findOne({ email: profile.emails[0].value });
 
        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id;
          user.avatar = profile.photos[0]?.value;
          await user.save();
          return done(null, user);
        }
 
        // Create new user from Google profile
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          avatar: profile.photos[0]?.value,
          role: 'user',
          isEmailVerified: true, // Google emails are pre-verified
        });
 
        logger.info(`New user registered via Google: ${user.email}`);
        return done(null, user);
      } catch (error) {
        logger.error('Google OAuth error:', error.message);
        return done(error, null);
      }
    }
  )
);
 
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});