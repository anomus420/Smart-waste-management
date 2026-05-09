/**
 * utils/helpers.js – General-purpose helper functions
 */
 
/**
 * Send a standardized success response.
 */
const sendSuccess = (res, data = {}, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data,
  });
};
 
/**
 * Send a standardized error response.
 */
const sendError = (res, message = 'Something went wrong', statusCode = 500, errors = null) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};
 
/**
 * Build MongoDB pagination options from query params.
 * @returns { skip, limit, page }
 */
const getPagination = (query) => {
  const page  = Math.max(1, parseInt(query.page)  || 1);
  const limit = Math.min(100, parseInt(query.limit) || 10);
  const skip  = (page - 1) * limit;
  return { page, limit, skip };
};
 
/**
 * Build a pagination meta object to attach to list responses.
 */
const paginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page * limit < total,
  hasPrevPage: page > 1,
});
 
/**
 * Strip undefined/null keys from an object (useful for partial updates).
 */
const cleanObject = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== ''));
 
/**
 * Delay helper for testing / rate-limiting simulation.
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
 
/**
 * Convert bytes to a human-readable string.
 */
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
 
module.exports = { sendSuccess, sendError, getPagination, paginationMeta, cleanObject, sleep, formatBytes };