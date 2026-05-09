/**
 * models/AwarenessArticle.js – Awareness Hub article schema
 */
 
const mongoose = require('mongoose');
 
const AwarenessArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Article title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    content: {
      type: String,
      required: [true, 'Article content is required'],
      minlength: [50, 'Content must be at least 50 characters'],
    },
    excerpt: {
      type: String,
      maxlength: [300, 'Excerpt cannot exceed 300 characters'],
      default: '',
    },
    coverImage: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      enum: [
        'waste_reduction',
        'recycling',
        'composting',
        'ewaste',
        'plastic_pollution',
        'sustainability',
        'policy',
        'tips',
      ],
      default: 'tips',
    },
    tags: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    readTime: {
      type: Number, // minutes
      default: 3,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
 
// Full-text search index on title + content
AwarenessArticleSchema.index({ title: 'text', content: 'text', tags: 'text' });
AwarenessArticleSchema.index({ category: 1, isPublished: 1 });
 
// Auto-generate excerpt from content if not provided
AwarenessArticleSchema.pre('save', function (next) {
  if (!this.excerpt && this.content) {
    this.excerpt = this.content.substring(0, 200).trim() + '...';
  }
  // Estimate read time: avg 200 words/min
  if (this.content) {
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.max(1, Math.ceil(wordCount / 200));
  }
  next();
});
 
module.exports = mongoose.model('AwarenessArticle', AwarenessArticleSchema); // this line also automatically creates a collection /subfolder in my online mongoose data atlas project folder (smartwaste_user)