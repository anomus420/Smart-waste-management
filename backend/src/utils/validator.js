/**
 * utils/validators.js – Shared validation helpers
 */
 
const { body, param, query } = require('express-validator');
 
// ─── Auth Validators ───────────────────────────────────────────────────────────
 
const signupValidator = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
];
 
const loginValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
];
 
// ─── Complaint Validators ──────────────────────────────────────────────────────
 
const complaintValidator = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be 5–100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be 10–1000 characters'),
  body('locationAddress')
    .trim()
    .notEmpty()
    .withMessage('Location address is required'),
];
 
// ─── E-Waste Validators ────────────────────────────────────────────────────────
 
const ewasteValidator = [
  body('wasteType').notEmpty().withMessage('Waste type is required'),
  body('quantity').trim().notEmpty().withMessage('Quantity description is required'),
  body('address').trim().notEmpty().withMessage('Pickup address is required'),
  body('pickupDate')
    .isISO8601()
    .withMessage('Valid pickup date is required')
    .custom((val) => {
      if (new Date(val) < new Date()) throw new Error('Pickup date must be in the future');
      return true;
    }),
];
 
// ─── Awareness Validators ──────────────────────────────────────────────────────
 
const articleValidator = [
  body('title').trim().isLength({ min: 5, max: 150 }).withMessage('Title must be 5–150 characters'),
  body('content').trim().isLength({ min: 50 }).withMessage('Content must be at least 50 characters'),
];
 
// ─── MongoDB ObjectId validator ────────────────────────────────────────────────
 
const mongoIdValidator = (field = 'id') =>
  param(field).isMongoId().withMessage(`Invalid ${field} format`);
 
module.exports = {
  signupValidator,
  loginValidator,
  complaintValidator,
  ewasteValidator,
  articleValidator,
  mongoIdValidator,
};