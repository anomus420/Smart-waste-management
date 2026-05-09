/**
 * config/cloudinary.js – Cloudinary image upload setup (optional)
 * Uncomment and configure if you prefer cloud storage over local disk.
 *
 * Add to .env:
 *   CLOUDINARY_CLOUD_NAME=your_cloud_name
 *   CLOUDINARY_API_KEY=your_api_key
 *   CLOUDINARY_API_SECRET=your_api_secret
 */
 
/*
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
 
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
 
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'smart-waste/complaints',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, crop: 'limit', quality: 'auto' }],
  },
});
 
module.exports = { cloudinary, storage };
*/
 
module.exports = {}; // placeholder until Cloudinary is enabled