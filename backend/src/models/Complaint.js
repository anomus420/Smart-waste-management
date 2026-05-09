/**
 * models/Complaint.js – Mongoose Complaint schema
 */
 
const mongoose = require('mongoose');
 
// Timeline event sub-document (tracks status changes)
const TimelineEventSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'resolved', 'rejected'],
      required: true,
    },
    message: { type: String, default: '' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);
 
const ComplaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    image: {
      type: String, // relative path or URL
      default: null,
    },
    location: {
      address: { type: String, required: [true, 'Location address is required'] },
      coordinates: {
        lat: { type: Number, default: null },
        lng: { type: Number, default: null },
      },
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'resolved', 'rejected'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    category: {
      type: String,
      enum: [
        'garbage_overflow',
        'illegal_dumping',
        'littering',
        'hazardous_waste',
        'drainage_blockage',
        'other',
      ],
      default: 'other',
    },
    // AI-suggested category + tips
    aiSuggestion: {
      category: { type: String, default: null },
      tips: [{ type: String }],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    timeline: [TimelineEventSchema],
    // Admin notes visible only to admins
    adminNotes: {
      type: String,
      default: '',
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
 
// ─── Indexes for common queries ────────────────────────────────────────────────
ComplaintSchema.index({ userId: 1, createdAt: -1 });
ComplaintSchema.index({ status: 1 });

 
// ─── Pre-save: auto-add first timeline event ───────────────────────────────────
ComplaintSchema.pre('save', function (next) {
  if (this.isNew) {
    this.timeline.push({ status: 'pending', message: 'Complaint filed successfully.' });
  }
  next();
});
 
module.exports = mongoose.model('Complaint', ComplaintSchema);