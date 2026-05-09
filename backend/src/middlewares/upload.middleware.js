/**
 * middlewares/upload.middleware.js
 * Configures Multer for local disk storage of complaint images.
 */
 
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const { sendError } = require('../utils/helpers');
 
// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/complaints');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
 
// ─── Storage engine ────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `complaint-${uniqueSuffix}${ext}`);
  },
});
 
// ─── File filter – images only ────────────────────────────────────────────────
const fileFilter = (_req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extOk  = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowedTypes.test(file.mimetype.replace('image/', ''));
 
  if (extOk && mimeOk) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, jpeg, png, webp, gif) are allowed'), false);
  }
};
 
// ─── Multer instance ──────────────────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5 MB
  },
});
 
// ─── Wrapper that returns a clean error response on multer errors ──────────────
const handleUpload = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return sendError(res, 'File size exceeds the 5 MB limit.', 400);
      }
      return sendError(res, `Upload error: ${err.message}`, 400);
    }
    if (err) {
      return sendError(res, err.message, 400);
    }
    next();
  });
};
 
module.exports = { upload, handleUpload };