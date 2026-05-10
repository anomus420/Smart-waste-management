/**
 * controllers/userController.js
 * User profile management + notification endpoints.
 */
 
const User = require('../models/User');
const { getUserNotifications, markAsRead } = require('../services/notificationService');
const { sendSuccess, sendError } = require('../utils/helpers');
 
// ─── GET /api/users/profile ────────────────────────────────────────────────────
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).lean();
    if (!user) return sendError(res, 'User not found.', 404);
    delete user.password;
    delete user.googleId;
    return sendSuccess(res, { user });
  } catch (error) {
    next(error);
  }
};
 
// ─── PUT /api/users/profile – Update name, phone, address, avatar ─────────────
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, removeAvatar } = req.body;
    const update = {};
    const unset = {};
    if (name)    update.name    = name.trim();
    if (phone)   update.phone   = phone.trim();
    if (address) update.address = address.trim();
 
    // Handle avatar upload
    if (req.file) {
      const path = require('path');
      update.avatar = `complaints/${path.basename(req.file.path)}`;
    } else if (removeAvatar === 'true') {
      unset.avatar = 1;
    }
 
    const updateOp = Object.keys(update).length > 0 ? { $set: update } : {};
    if (Object.keys(unset).length > 0) updateOp.$unset = unset;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateOp,
      { new: true, runValidators: true }
    ).select('-password -googleId');
 
    return sendSuccess(res, { user }, 'Profile updated successfully.');
  } catch (error) {
    next(error);
  }
};
 
// ─── GET /api/users/notifications ─────────────────────────────────────────────
const getNotifications = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const { notifications, unreadCount } = await getUserNotifications(req.user._id, limit);
    return sendSuccess(res, { notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};
 
// ─── PUT /api/users/notifications/read – Mark notifications as read ────────────
const markNotificationsRead = async (req, res, next) => {
  try {
    const { ids = [] } = req.body; // empty array = mark ALL as read
    const count = await markAsRead(req.user._id, ids);
    return sendSuccess(res, { markedCount: count }, `${count} notification(s) marked as read.`);
  } catch (error) {
    next(error);
  }
};
 
// ─── GET /api/users/stats – User's own stats ─────────────────────────────────
const getUserStats = async (req, res, next) => {
  try {
    const Complaint   = require('../models/Complaint');
    const EWastePickup = require('../models/EWastePickup');
 
    const [totalComplaints, resolvedComplaints, totalPickups] = await Promise.all([
      Complaint.countDocuments({ userId: req.user._id }),
      Complaint.countDocuments({ userId: req.user._id, status: 'resolved' }),
      EWastePickup.countDocuments({ userId: req.user._id }),
    ]);
 
    return sendSuccess(res, {
      stats: { totalComplaints, resolvedComplaints, totalPickups, ecoPoints: req.user.ecoPoints },
    });
  } catch (error) {
    next(error);
  }
};
 
module.exports = { getProfile, updateProfile, getNotifications, markNotificationsRead, getUserStats };