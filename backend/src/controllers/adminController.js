/**
 * controllers/adminController.js
 * Admin-only routes: dashboard stats, complaint management, user management.
 */
 
const User        = require('../models/User');
const Complaint   = require('../models/Complaint');
const EWastePickup = require('../models/EWastePickup');
const WasteCenter = require('../models/WasteCenter');
const { notifyComplaintUpdate } = require('../services/notificationService');
const { sendComplaintStatusEmail } = require('../services/emailService');
const { sendComplaintSMS } = require('../services/smsService');
const { sendSuccess, sendError, getPagination, paginationMeta } = require('../utils/helpers');
const logger = require('../utils/logger');
 
// ─── GET /api/admin/dashboard ──────────────────────────────────────────────────
const getDashboard = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalComplaints,
      pendingComplaints,
      inProgressComplaints,
      resolvedComplaints,
      rejectedComplaints,
      totalPickups,
      pendingPickups,
      recentComplaints,
      // Category distribution
      categoryStats,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'pending' }),
      Complaint.countDocuments({ status: 'in_progress' }),
      Complaint.countDocuments({ status: 'resolved' }),
      Complaint.countDocuments({ status: 'rejected' }),
      EWastePickup.countDocuments(),
      EWastePickup.countDocuments({ status: 'requested' }),
      Complaint.find().sort({ createdAt: -1 }).limit(5)
        .populate('userId', 'name email').lean(),
      Complaint.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);
 
    // Monthly complaint trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
 
    const monthlyTrend = await Complaint.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year:  { $year:  '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
 
    return sendSuccess(res, {
      stats: {
        users:       { total: totalUsers },
        complaints:  { total: totalComplaints, pending: pendingComplaints, inProgress: inProgressComplaints, resolved: resolvedComplaints, rejected: rejectedComplaints },
        ewaste:      { total: totalPickups, pending: pendingPickups },
      },
      recentComplaints,
      categoryStats,
      monthlyTrend,
    });
  } catch (error) {
    next(error);
  }
};
 
// ─── GET /api/admin/complaints – All complaints with filters ───────────────────
const getAllComplaints = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { status, priority, category, search } = req.query;
 
    const filter = {};
    if (status)   filter.status   = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (search)   filter.$or = [
      { title:       new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
      { 'location.address': new RegExp(search, 'i') },
    ];
 
    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .populate('userId', 'name email phone avatar')
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Complaint.countDocuments(filter),
    ]);
 
    return sendSuccess(res, { complaints, pagination: paginationMeta(total, page, limit) });
  } catch (error) {
    next(error);
  }
};
 
// ─── PUT /api/admin/complaints/:id – Update status, priority, notes ────────────
const updateComplaintByAdmin = async (req, res, next) => {
  try {
    const { status, priority, adminNotes, assignedTo, statusMessage } = req.body;
    const complaint = await Complaint.findById(req.params.id).populate('userId', 'name email phone');
 
    if (!complaint) return sendError(res, 'Complaint not found.', 404);
 
    const statusChanged = status && status !== complaint.status;
 
    if (status)      complaint.status    = status;
    if (priority)    complaint.priority  = priority;
    if (adminNotes)  complaint.adminNotes = adminNotes;
    if (assignedTo)  complaint.assignedTo = assignedTo;
 
    // Add timeline event on status change
    if (statusChanged) {
      complaint.timeline.push({
        status,
        message: statusMessage || `Status updated to ${status} by admin.`,
        updatedBy: req.user._id,
      });
 
      // Notify the complaint owner
      const owner = complaint.userId;
      if (owner) {
        notifyComplaintUpdate(owner._id, complaint, status).catch(() => {});
        sendComplaintStatusEmail(owner, complaint, status).catch(() => {});
        sendComplaintSMS(owner.phone, complaint.title, status).catch(() => {});
      }
    }
 
    await complaint.save();
    logger.info(`Admin ${req.user.email} updated complaint ${complaint._id} → ${status}`);
 
    return sendSuccess(res, { complaint }, 'Complaint updated successfully.');
  } catch (error) {
    next(error);
  }
};
 
// ─── GET /api/admin/users – All users ─────────────────────────────────────────
const getAllUsers = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { search, role, isBlocked } = req.query;
 
    const filter = {};
    if (role)     filter.role      = role;
    if (isBlocked !== undefined) filter.isBlocked = isBlocked === 'true';
    if (search)   filter.$or = [
      { name:  new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
    ];
 
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -googleId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);
 
    return sendSuccess(res, { users, pagination: paginationMeta(total, page, limit) });
  } catch (error) {
    next(error);
  }
};
 
// ─── PUT /api/admin/users/:id/block – Block or unblock a user ─────────────────
const toggleUserBlock = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 'User not found.', 404);
    if (user.role === 'admin') return sendError(res, 'Cannot block an admin.', 403);
 
    user.isBlocked = !user.isBlocked;
    await user.save({ validateBeforeSave: false });
 
    const action = user.isBlocked ? 'blocked' : 'unblocked';
    logger.info(`Admin ${req.user.email} ${action} user ${user.email}`);
 
    return sendSuccess(res, { isBlocked: user.isBlocked }, `User ${action} successfully.`);
  } catch (error) {
    next(error);
  }
};
 
// ─── DELETE /api/admin/users/:id – Delete a user ─────────────────────────────
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 'User not found.', 404);
    if (user.role === 'admin') return sendError(res, 'Cannot delete an admin.', 403);
 
    await user.deleteOne();
    logger.warn(`Admin ${req.user.email} deleted user ${user.email}`);
 
    return sendSuccess(res, {}, 'User deleted successfully.');
  } catch (error) {
    next(error);
  }
};
 
// ─── GET /api/admin/ewaste – All e-waste pickups ──────────────────────────────
const getAllPickups = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { status } = req.query;
 
    const filter = {};
    if (status) filter.status = status;
 
    const [pickups, total] = await Promise.all([
      EWastePickup.find(filter)
        .populate('userId', 'name email phone')
        .sort({ pickupDate: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      EWastePickup.countDocuments(filter),
    ]);
 
    return sendSuccess(res, { pickups, pagination: paginationMeta(total, page, limit) });
  } catch (error) {
    next(error);
  }
};
 
// ─── PUT /api/admin/ewaste/:id – Update pickup status ────────────────────────
const updatePickupByAdmin = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    const pickup = await EWastePickup.findById(req.params.id).populate('userId', 'name email phone');
 
    if (!pickup) return sendError(res, 'Pickup not found.', 404);
 
    if (status)     pickup.status     = status;
    if (adminNotes) pickup.adminNotes = adminNotes;
 
    await pickup.save();
 
    // Notify user
    if (status && pickup.userId) {
      notifyEwasteUpdate(pickup.userId._id, pickup, status).catch(() => {});
    }
 
    return sendSuccess(res, { pickup }, 'Pickup updated successfully.');
  } catch (error) {
    next(error);
  }
};
 
// Require notifyEwasteUpdate here too
const { notifyEwasteUpdate } = require('../services/notificationService');
 
// ─── Waste Centers CRUD ────────────────────────────────────────────────────────
const createWasteCenter = async (req, res, next) => {
  try {
    const { name, address, lat, lng, phone, email, operatingHours, acceptedWasteTypes, city, state } = req.body;
 
    const center = await WasteCenter.create({
      name, address, lat, lng,
      location: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
      phone, email, operatingHours, acceptedWasteTypes, city, state,
    });
 
    return sendSuccess(res, { center }, 'Waste center created.', 201);
  } catch (error) {
    next(error);
  }
};
 
const deleteWasteCenter = async (req, res, next) => {
  try {
    const center = await WasteCenter.findByIdAndDelete(req.params.id);
    if (!center) return sendError(res, 'Waste center not found.', 404);
    return sendSuccess(res, {}, 'Waste center deleted.');
  } catch (error) {
    next(error);
  }
};
 
module.exports = {
  getDashboard,
  getAllComplaints,
  updateComplaintByAdmin,
  getAllUsers,
  toggleUserBlock,
  deleteUser,
  getAllPickups,
  updatePickupByAdmin,
  createWasteCenter,
  deleteWasteCenter,
};