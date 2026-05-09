/**
 * routes/user.routes.js
 */
 
const router = require('express').Router();
 
const {
  getProfile,
  updateProfile,
  getNotifications,
  markNotificationsRead,
  getUserStats,
} = require('../controllers/userController');
 
const { protect }      = require('../middlewares/auth.middleware');
const { handleUpload } = require('../middlewares/upload.middleware');
 
router.use(protect);
 
router.get('/profile',    getProfile);
router.put('/profile',    handleUpload('avatar'), updateProfile);
router.get('/stats',      getUserStats);
 
router.get('/notifications',       getNotifications);
router.put('/notifications/read',  markNotificationsRead);
 
module.exports = router;
 