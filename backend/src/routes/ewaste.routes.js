/**
 * routes/ewaste.routes.js
 */
 
const router = require('express').Router();
 
const {
  createPickup,
  getMyPickups,
  getPickupById,
  cancelPickup,
  getWasteCenters,
} = require('../controllers/ewasteController');
 
const { protect }  = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validator.middleware');
const { ewasteValidator, mongoIdValidator } = require('../utils/validator');
 
// Public route
router.get('/centers', getWasteCenters);
 
// Protected routes
router.use(protect);
 
router
  .route('/')
  .get(getMyPickups)
  .post(ewasteValidator, validate, createPickup);
 
router
  .route('/:id')
  .get(mongoIdValidator('id'), validate, getPickupById)
  .put(mongoIdValidator('id'), validate, cancelPickup);
 
module.exports = router;