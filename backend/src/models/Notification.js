/**
 * models/Notification.js – In-app notification schema
 */
 
const mongoose = require('mongoose');
 
const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'complaint_update',
        'ewaste_update',
        'system',
        'info',
        'warning',
      ],
      default: 'info',
    },
    // Optional reference to a complaint or ewaste doc
    refModel: {
      type: String,
      enum: ['Complaint', 'EWastePickup', null],
      default: null,
    },
    refId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);
 
// Index for fast per-user notification queries
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
 
// Auto-delete notifications older than 90 days
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });
 
module.exports = mongoose.model('Notification', NotificationSchema);