/**
 * routes/complaint.routes.js
 */
 
const router = require('express').Router();
 
const {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
  getNearbyComplaints,
} = require('../controllers/complaintController');
 
const { protect }    = require('../middlewares/auth.middleware');
const { validate }   = require('../middlewares/validator.middleware');
const { handleUpload } = require('../middlewares/upload.middleware');
const { uploadLimiter } = require('../middlewares/rateLimiter');
const { complaintValidator, mongoIdValidator } = require('../utils/validator');
 
// All complaint routes require authentication
router.use(protect);
 
router.get('/nearby', getNearbyComplaints);
 
router
  .route('/')
  .get(getMyComplaints)
  .post(uploadLimiter, handleUpload('image'), complaintValidator, validate, createComplaint);
 
router
  .route('/:id')
  .get(mongoIdValidator('id'), validate, getComplaintById)
  .put(handleUpload('image'), mongoIdValidator('id'), validate, updateComplaint)
  .delete(mongoIdValidator('id'), validate, deleteComplaint);
 
module.exports = router;