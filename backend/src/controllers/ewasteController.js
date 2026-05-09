/**
 * controllers/ewasteController.js
 * E-Waste pickup request endpoints (user-facing).
 */
 
const EWastePickup = require('../models/EWastePickup');
const { notifyEwasteUpdate }  = require('../services/notificationService');
const { sendPickupConfirmationEmail } = require('../services/emailService');
const { sendPickupSMS } = require('../services/smsService');
const { sendSuccess, sendError, getPagination, paginationMeta } = require('../utils/helpers');
const logger = require('../utils/logger');
 
// ─── POST /api/ewaste – Create pickup request ──────────────────────────────────
const createPickup = async (req, res, next) => {
  try {
    const {
      wasteType,
      quantity,
      description,
      address,
      pickupDate,
      pickupTimeSlot,
      contactPhone,
      lat,
      lng,
    } = req.body;
 
    const pickup = await EWastePickup.create({
      userId: req.user._id,
      wasteType,
      quantity,
      description,
      address,
      pickupDate: new Date(pickupDate),
      pickupTimeSlot,
      contactPhone: contactPhone || req.user.phone,
      coordinates: { lat: lat ? parseFloat(lat) : null, lng: lng ? parseFloat(lng) : null },
    });
 
    // Non-blocking notifications
    sendPickupConfirmationEmail(req.user, pickup).catch(() => {});
    sendPickupSMS(req.user.phone, pickup.pickupDate).catch(() => {});
 
    logger.info(`E-waste pickup requested by ${req.user.email} for ${pickupDate}`);
    return sendSuccess(res, { pickup }, 'Pickup request submitted successfully.', 201);
  } catch (error) {
    next(error);
  }
};
 
// ─── GET /api/ewaste – Get user's own pickup requests ─────────────────────────
const getMyPickups = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { status } = req.query;
 
    const filter = { userId: req.user._id };
    if (status) filter.status = status;
 
    const [pickups, total] = await Promise.all([
      EWastePickup.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      EWastePickup.countDocuments(filter),
    ]);
 
    return sendSuccess(res, { pickups, pagination: paginationMeta(total, page, limit) });
  } catch (error) {
    next(error);
  }
};
 
// ─── GET /api/ewaste/:id – Single pickup detail ────────────────────────────────
const getPickupById = async (req, res, next) => {
  try {
    const pickup = await EWastePickup.findById(req.params.id).lean();
 
    if (!pickup) return sendError(res, 'Pickup request not found.', 404);
 
    if (req.user.role !== 'admin' && pickup.userId.toString() !== req.user._id.toString()) {
      return sendError(res, 'Access denied.', 403);
    }
 
    return sendSuccess(res, { pickup });
  } catch (error) {
    next(error);
  }
};
 
// ─── PUT /api/ewaste/:id – User can cancel their own requested pickup ──────────
const cancelPickup = async (req, res, next) => {
  try {
    const pickup = await EWastePickup.findById(req.params.id);
 
    if (!pickup) return sendError(res, 'Pickup request not found.', 404);
 
    if (pickup.userId.toString() !== req.user._id.toString()) {
      return sendError(res, 'Access denied.', 403);
    }
 
    if (!['requested'].includes(pickup.status)) {
      return sendError(res, 'Only pending pickup requests can be cancelled.', 400);
    }
 
    pickup.status = 'cancelled';
    await pickup.save();
 
    return sendSuccess(res, { pickup }, 'Pickup request cancelled.');
  } catch (error) {
    next(error);
  }
};
 
// ─── GET /api/ewaste/centers – Waste centers list (public) ────────────────────
const getWasteCenters = async (req, res, next) => {
  try {
    const WasteCenter = require('../models/WasteCenter');
    const { city } = req.query;
 
    const filter = { isActive: true };
    if (city) filter.city = new RegExp(city, 'i');
 
    const centers = await WasteCenter.find(filter).lean();
    return sendSuccess(res, { centers, count: centers.length });
  } catch (error) {
    next(error);
  }
};
 
module.exports = { createPickup, getMyPickups, getPickupById, cancelPickup, getWasteCenters };