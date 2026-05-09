/**
 * controllers/complaintController.js
 * CRUD operations for complaints (user-facing).
 */

const Complaint  = require('../models/Complaint');
const { getComplaintSuggestion } = require('../services/aiService');
const { notifyComplaintUpdate }  = require('../services/notificationService');
const { sendSuccess, sendError, getPagination, paginationMeta } = require('../utils/helpers');
const logger = require('../utils/logger');
const path   = require('path');

// ─── POST /api/complaints – File a complaint ────────────────────────────────────
const createComplaint = async (req, res, next) => {
  try {
    const { title, description, locationAddress, locationLat, locationLng, category, isAnonymous } = req.body;

    // Build image path if a file was uploaded
    const imagePath = req.file
      ? `complaints/${path.basename(req.file.path)}`
      : null;

    // Get AI category suggestion asynchronously (don't block response)
    let aiSuggestion = { category: null, tips: [] };
    try {
      aiSuggestion = await getComplaintSuggestion(title, description);
    } catch (_) {}

    const complaint = await Complaint.create({
      title,
      description,
      image: imagePath,
      location: {
        address: locationAddress,
        coordinates: {
          lat: locationLat ? parseFloat(locationLat) : null,
          lng: locationLng ? parseFloat(locationLng) : null,
        },
      },
      category: category || aiSuggestion.category || 'other',
      aiSuggestion,
      isAnonymous: isAnonymous === 'true' || isAnonymous === true,
      userId: req.user._id,
    });

    // Populate userId so the emitted payload includes the user's name
    await complaint.populate('userId', 'name');

    // ── Emit real-time event to all connected Socket.io clients ──────────────
    const io = req.app.get('io');
    if (io && complaint.location?.coordinates?.lat && complaint.location?.coordinates?.lng) {
      io.emit('new_complaint', {
        _id:       complaint._id,
        title:     complaint.title,
        category:  complaint.category,
        status:    complaint.status,
        priority:  complaint.priority,
        location:  complaint.location,
        isAnonymous: complaint.isAnonymous,
        // Don't expose userId if the complaint was filed anonymously
        userId:    complaint.isAnonymous ? null : complaint.userId,
        createdAt: complaint.createdAt,
      });
    }
    // ── End socket emit ───────────────────────────────────────────────────────

    logger.info(`Complaint filed by ${req.user.email}: "${title}"`);
    return sendSuccess(res, { complaint }, 'Complaint filed successfully.', 201);
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/complaints – User's own complaints ───────────────────────────────
const getMyComplaints = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { status } = req.query;

    const filter = { userId: req.user._id };
    if (status) filter.status = status;

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Complaint.countDocuments(filter),
    ]);

    return sendSuccess(res, {
      complaints,
      pagination: paginationMeta(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/complaints/:id – Single complaint detail ────────────────────────
const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('userId', 'name email avatar')
      .populate('assignedTo', 'name email')
      .populate('timeline.updatedBy', 'name');

    if (!complaint) {
      return sendError(res, 'Complaint not found.', 404);
    }

    // Users can only view their own complaints (admins bypass this in admin routes)
    if (
      req.user.role !== 'admin' &&
      complaint.userId._id.toString() !== req.user._id.toString()
    ) {
      return sendError(res, 'Access denied.', 403);
    }

    return sendSuccess(res, { complaint });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/complaints/:id – User can update ONLY pending complaints ─────────
const updateComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) return sendError(res, 'Complaint not found.', 404);

    if (complaint.userId.toString() !== req.user._id.toString()) {
      return sendError(res, 'Access denied.', 403);
    }

    if (complaint.status !== 'pending') {
      return sendError(res, 'Only pending complaints can be edited.', 400);
    }

    const { title, description, locationAddress, locationLat, locationLng } = req.body;

    if (title)             complaint.title = title;
    if (description)       complaint.description = description;
    if (locationAddress)   complaint.location.address = locationAddress;
    if (locationLat)       complaint.location.coordinates.lat = parseFloat(locationLat);
    if (locationLng)       complaint.location.coordinates.lng = parseFloat(locationLng);
    if (req.file)          complaint.image = `complaints/${path.basename(req.file.path)}`;

    await complaint.save();

    return sendSuccess(res, { complaint }, 'Complaint updated successfully.');
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/complaints/:id – User can delete their own pending complaint ──
const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) return sendError(res, 'Complaint not found.', 404);

    if (complaint.userId.toString() !== req.user._id.toString()) {
      return sendError(res, 'Access denied.', 403);
    }

    if (complaint.status !== 'pending') {
      return sendError(res, 'Only pending complaints can be deleted.', 400);
    }

    await complaint.deleteOne();

    return sendSuccess(res, {}, 'Complaint deleted successfully.');
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/complaints/nearby – complaints close to given coords ─────────────
const getNearbyComplaints = async (req, res, next) => {
  try {
    const { lat, lng, radius = 5 } = req.query; // radius in km
    if (!lat || !lng) return sendError(res, 'lat and lng are required.', 400);

    // Simple bounding box filter (no geospatial index needed)
    const latRange = parseFloat(radius) / 111;
    const lngRange = parseFloat(radius) / (111 * Math.cos((parseFloat(lat) * Math.PI) / 180));

    const complaints = await Complaint.find({
      'location.coordinates.lat': { $gte: parseFloat(lat) - latRange, $lte: parseFloat(lat) + latRange },
      'location.coordinates.lng': { $gte: parseFloat(lng) - lngRange, $lte: parseFloat(lng) + lngRange },
      status: { $ne: 'resolved' },
    })
      .select('title status location category createdAt')
      .limit(50)
      .lean();

    return sendSuccess(res, { complaints, count: complaints.length });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
  getNearbyComplaints,
};