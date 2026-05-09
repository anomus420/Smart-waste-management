/**
 * controllers/awarenessController.js
 * Awareness Hub: CRUD for articles. Read is public, Write is admin-only.
 */
 
const AwarenessArticle = require('../models/AwarenessArticle');
const { sendSuccess, sendError, getPagination, paginationMeta } = require('../utils/helpers');
const logger = require('../utils/logger');
 
// ─── GET /api/awareness – List published articles (public) ────────────────────
const getArticles = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { category, search } = req.query;
 
    const filter = { isPublished: true };
    if (category) filter.category = category;
    if (search)   filter.$text = { $search: search };
 
    const [articles, total] = await Promise.all([
      AwarenessArticle.find(filter)
        .populate('createdBy', 'name')
        .select('-content') // exclude full content from list view
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AwarenessArticle.countDocuments(filter),
    ]);
 
    return sendSuccess(res, { articles, pagination: paginationMeta(total, page, limit) });
  } catch (error) {
    next(error);
  }
};
 
// ─── GET /api/awareness/:id – Single article (public) ─────────────────────────
const getArticleById = async (req, res, next) => {
  try {
    const article = await AwarenessArticle.findById(req.params.id)
      .populate('createdBy', 'name avatar');
 
    if (!article || !article.isPublished) {
      return sendError(res, 'Article not found.', 404);
    }
 
    // Increment view count (fire-and-forget)
    AwarenessArticle.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).exec();
 
    return sendSuccess(res, { article });
  } catch (error) {
    next(error);
  }
};
 
// ─── POST /api/awareness – Create article (admin) ─────────────────────────────
const createArticle = async (req, res, next) => {
  try {
    const { title, content, excerpt, category, tags, isPublished } = req.body;
 
    const article = await AwarenessArticle.create({
      title,
      content,
      excerpt,
      category,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim())) : [],
      isPublished: isPublished !== false,
      createdBy: req.user._id,
      coverImage: req.file ? `complaints/${require('path').basename(req.file.path)}` : null,
    });
 
    logger.info(`Article created by admin ${req.user.email}: "${title}"`);
    return sendSuccess(res, { article }, 'Article created successfully.', 201);
  } catch (error) {
    next(error);
  }
};
 
// ─── PUT /api/awareness/:id – Update article (admin) ──────────────────────────
const updateArticle = async (req, res, next) => {
  try {
    const { title, content, excerpt, category, tags, isPublished } = req.body;
    const update = {};
 
    if (title !== undefined)       update.title       = title;
    if (content !== undefined)     update.content     = content;
    if (excerpt !== undefined)     update.excerpt     = excerpt;
    if (category !== undefined)    update.category    = category;
    if (isPublished !== undefined) update.isPublished = isPublished;
    if (tags !== undefined)        update.tags        = Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim());
 
    const article = await AwarenessArticle.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true }
    );
 
    if (!article) return sendError(res, 'Article not found.', 404);
 
    return sendSuccess(res, { article }, 'Article updated successfully.');
  } catch (error) {
    next(error);
  }
};
 
// ─── DELETE /api/awareness/:id – Delete article (admin) ───────────────────────
const deleteArticle = async (req, res, next) => {
  try {
    const article = await AwarenessArticle.findByIdAndDelete(req.params.id);
    if (!article) return sendError(res, 'Article not found.', 404);
 
    logger.info(`Article deleted by admin ${req.user.email}: "${article.title}"`);
    return sendSuccess(res, {}, 'Article deleted successfully.');
  } catch (error) {
    next(error);
  }
};
 
module.exports = { getArticles, getArticleById, createArticle, updateArticle, deleteArticle };