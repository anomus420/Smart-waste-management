/**
 * models/User.js – Mongoose User schema
 */
 
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
 
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never returned in queries by default
    },
    googleId: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: null,
      match: [/^\+?[\d\s\-()]{7,15}$/, 'Please enter a valid phone number'],
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    address: {
      type: String,
      default: null,
    },
    // Points/gamification for engagement
    ecoPoints: {
      type: Number,
      default: 0,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
 
// ─── Virtual: complaint count ──────────────────────────────────────────────────
UserSchema.virtual('complaintCount', {
  ref: 'Complaint',
  localField: '_id',
  foreignField: 'userId',
  count: true,
});
 
// ─── Pre-save: hash password ───────────────────────────────────────────────────
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
 
// ─── Method: compare password ──────────────────────────────────────────────────
UserSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};
 
// ─── Method: public profile (strips sensitive fields) ─────────────────────────
UserSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.googleId;
  return obj;
};
 
module.exports = mongoose.model('User', UserSchema);