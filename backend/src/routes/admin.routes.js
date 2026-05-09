/**
 * routes/admin.routes.js
 * All routes protected by JWT + admin role check.
 */
 
const router = require('express').Router();
 
const {
  getDashboard,
  getAllComplaints,
  updateComplaintByAdmin,
  getAllUsers,
  toggleUserBlock,
  deleteUser,
  getAllPickups,
  updatePickupByAdmin,
  createWasteCenter,
  deleteWasteCenter,
} = require('../controllers/adminController');
 
const { protect }    = require('../middlewares/auth.middleware');
const { adminOnly }  = require('../middlewares/role.middleware');
const { validate }   = require('../middlewares/validator.middleware');
const { mongoIdValidator } = require('../utils/validator');
 
// Apply auth + admin role to every route in this file
router.use(protect, adminOnly);
 
// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get('/dashboard', getDashboard);
 
// ─── Complaints ───────────────────────────────────────────────────────────────
router.get('/complaints', getAllComplaints);
router.put('/complaints/:id', mongoIdValidator('id'), validate, updateComplaintByAdmin);
 
// ─── Users ────────────────────────────────────────────────────────────────────
router.get('/users', getAllUsers);
router.put('/users/:id/block', mongoIdValidator('id'), validate, toggleUserBlock);
router.delete('/users/:id',    mongoIdValidator('id'), validate, deleteUser);
 
// ─── E-Waste Pickups ──────────────────────────────────────────────────────────
router.get('/ewaste', getAllPickups);
router.put('/ewaste/:id', mongoIdValidator('id'), validate, updatePickupByAdmin);
 
// ─── Waste Centers ────────────────────────────────────────────────────────────
router.post('/centers', createWasteCenter);
router.delete('/centers/:id', mongoIdValidator('id'), validate, deleteWasteCenter);
 
module.exports = router;