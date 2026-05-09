/**
 * routes/awareness.routes.js
 * Public: GET articles
 * Admin-only: POST, PUT, DELETE
 */
 
const router = require('express').Router();
 
const {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
} = require('../controllers/awarenessController');
 
const { protect }    = require('../middlewares/auth.middleware');
const { adminOnly }  = require('../middlewares/role.middleware');
const { validate }   = require('../middlewares/validator.middleware');
const { handleUpload } = require('../middlewares/upload.middleware');
const { articleValidator, mongoIdValidator } = require('../utils/validator');
 
// Public
router.get('/',    getArticles);
router.get('/:id', mongoIdValidator('id'), validate, getArticleById);
 
// Admin only
router.post(
  '/',
  protect,
  adminOnly,
  handleUpload('coverImage'),
  articleValidator,
  validate,
  createArticle
);
 
router.put(
  '/:id',
  protect,
  adminOnly,
  mongoIdValidator('id'),
  handleUpload('coverImage'),
  validate,
  updateArticle
);
 
router.delete(
  '/:id',
  protect,
  adminOnly,
  mongoIdValidator('id'),
  validate,
  deleteArticle
);
 
module.exports = router;