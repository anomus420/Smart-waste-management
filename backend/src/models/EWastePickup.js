/**
 * models/EWastePickup.js – E-Waste Pickup Request schema
 */
 
const mongoose = require('mongoose');
 
const EWastePickupSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    wasteType: {
      type: String,
      required: [true, 'Waste type is required'],
      enum: [
        'mobile_phones',
        'laptops',
        'tablets',
        'televisions',
        'refrigerators',
        'washing_machines',
        'printers',
        'batteries',
        'cables_accessories',
        'other',
      ],
    },
    quantity: {
      type: String,
      required: [true, 'Quantity description is required'],
      maxlength: [200, 'Quantity description too long'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    address: {
      type: String,
      required: [true, 'Pickup address is required'],
    },
    coordinates: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    pickupDate: {
      type: Date,
      required: [true, 'Preferred pickup date is required'],
    },
    pickupTimeSlot: {
      type: String,
      enum: ['morning', 'afternoon', 'evening'],
      default: 'morning',
    },
    status: {
      type: String,
      enum: ['requested', 'confirmed', 'picked_up', 'cancelled'],
      default: 'requested',
    },
    contactPhone: {
      type: String,
      default: null,
    },
    adminNotes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);
 
EWastePickupSchema.index({ userId: 1, createdAt: -1 });
EWastePickupSchema.index({ status: 1 });
EWastePickupSchema.index({ pickupDate: 1 });
 
module.exports = mongoose.model('EWastePickup', EWastePickupSchema);