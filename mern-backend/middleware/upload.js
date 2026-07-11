const multer = require('multer');
const { imageStorage, videoStorage } = require('../config/cloudinary');

/**
 * uploadImages — Multer middleware for property gallery images.
 * Intercepts files, sends them directly to Cloudinary via our custom
 * CloudinaryStorage engine, and returns CDN URLs on req.files[n].path
 * Max 15 images per request.
 */
const uploadImages = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per image
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    allowed.test(file.mimetype) ? cb(null, true) : cb(new Error('Only JPEG, PNG, and WebP allowed.'));
  },
}).array('images', 15);

/**
 * uploadVideo — Single drone walkthrough video.
 * Cloudinary auto-compresses for 3G/4G mobile streaming.
 * Max 500MB.
 */
const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /mp4|mov|avi|webm/;
    allowed.test(file.mimetype.split('/')[1]) ? cb(null, true) : cb(new Error('Only MP4, MOV, AVI, WebM allowed.'));
  },
}).single('video');

/**
 * uploadFeaturedImage — Single card thumbnail.
 */
const uploadFeaturedImage = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    cb(null, allowed.test(file.mimetype));
  },
}).single('featuredImage');

module.exports = { uploadImages, uploadVideo, uploadFeaturedImage };
