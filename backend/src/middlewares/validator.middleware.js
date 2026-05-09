/**
 * middlewares/validator.middleware.js
 * Reads express-validator results and short-circuits with 422 if invalid.
 */
 
const { validationResult } = require('express-validator');
const { sendError } = require('../utils/helpers');
 
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));
    return sendError(res, 'Validation failed', 422, formatted);
  }
  next();
};
 
module.exports = { validate };
 