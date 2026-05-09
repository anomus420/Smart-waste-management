/**
 * services/notificationService.js
 * Creates in-app notifications; optionally dispatches email/SMS.
 */
 
const Notification = require('../models/Notification');
const logger = require('../utils/logger');
 
/**
 * Create a single in-app notification.
 */
const createNotification = async ({ userId, title, message, type = 'info', refModel = null, refId = null }) => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      refModel,
      refId,
    });
    return notification;
  } catch (error) {
    // Non-critical — log but don't throw
    logger.error('Failed to create notification:', error.message);
    return null;
  }
};
 
/**
 * Notify a user about a complaint status change.
 */
const notifyComplaintUpdate = async (userId, complaint, newStatus) => {
  const statusMessages = {
    in_progress: 'Your complaint is now being processed by our team.',
    resolved:    'Great news! Your complaint has been resolved.',
    rejected:    'Your complaint has been reviewed and was not actionable at this time.',
  };
 
  const message = statusMessages[newStatus] || `Your complaint status changed to: ${newStatus}`;
 
  return createNotification({
    userId,
    title: `Complaint Update: ${complaint.title}`,
    message,
    type: 'complaint_update',
    refModel: 'Complaint',
    refId: complaint._id,
  });
};
 
/**
 * Notify a user about an e-waste pickup status change.
 */
const notifyEwasteUpdate = async (userId, pickup, newStatus) => {
  const statusMessages = {
    confirmed:  'Your e-waste pickup has been confirmed.',
    picked_up:  'Your e-waste has been successfully collected. Thank you!',
    cancelled:  'Your e-waste pickup request was cancelled.',
  };
 
  const message = statusMessages[newStatus] || `E-waste pickup status: ${newStatus}`;
 
  return createNotification({
    userId,
    title: 'E-Waste Pickup Update',
    message,
    type: 'ewaste_update',
    refModel: 'EWastePickup',
    refId: pickup._id,
  });
};
 
/**
 * Get all notifications for a user (with unread count).
 */
const getUserNotifications = async (userId, limit = 20) => {
  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ userId }).sort({ createdAt: -1 }).limit(limit).lean(),
    Notification.countDocuments({ userId, isRead: false }),
  ]);
 
  return { notifications, unreadCount };
};
 
/**
 * Mark specific notifications as read.
 */
const markAsRead = async (userId, notificationIds = []) => {
  const filter = { userId, isRead: false };
  if (notificationIds.length > 0) {
    filter._id = { $in: notificationIds };
  }
  const result = await Notification.updateMany(filter, {
    $set: { isRead: true, readAt: new Date() },
  });
  return result.modifiedCount;
};
 
module.exports = {
  createNotification,
  notifyComplaintUpdate,
  notifyEwasteUpdate,
  getUserNotifications,
  markAsRead,
};