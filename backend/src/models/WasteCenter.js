/**
 * models/WasteCenter.js – Waste Collection Center schema
 */
 
const mongoose = require('mongoose');
 
const WasteCenterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Center name is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude] — GeoJSON order
        required: true,
      },
    },
    // Human-readable lat/lng for simplicity in frontend
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    phone: { type: String, default: null },
    email: { type: String, default: null },
    operatingHours: {
      type: String,
      default: 'Mon–Sat: 9:00 AM – 6:00 PM',
    },
    acceptedWasteTypes: {
      type: [String],
      default: ['general', 'recyclable', 'ewaste'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
  },
  { timestamps: true }
);
 
// GeoSpatial index for nearby queries
WasteCenterSchema.index({ location: '2dsphere' });
 
module.exports = mongoose.model('WasteCenter', WasteCenterSchema);