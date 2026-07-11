const express    = require('express');
const router     = express.Router();
const {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  publishPropertyToWordPress,
} = require('../controllers/propertyController');
const { protect, adminOnly } = require('../middleware/auth');
const { uploadImages, uploadFeaturedImage } = require('../middleware/upload');
const multer = require('multer');

// ---- Public Routes (WordPress frontend + anyone) ----
router.get('/',    getProperties);
router.get('/:id', getPropertyById);

// ---- Admin Only Routes ----
// Create a property — accepts multipart/form-data with images + featuredImage
router.post(
  '/',
  protect,
  adminOnly,
  (req, res, next) => {
    // Accept both featuredImage (single) and images (multiple) in one request
    const upload = multer({
      storage: require('../config/cloudinary').assetStorage,
    }).fields([
      { name: 'featuredImage', maxCount: 1 },
      { name: 'videoFile',     maxCount: 1 },
      { name: 'images',        maxCount: 15 },
    ]);
    upload(req, res, next);
  },
  createProperty
);

// Update a property
router.put(
  '/:id',
  protect,
  adminOnly,
  (req, res, next) => {
    const upload = multer({
      storage: require('../config/cloudinary').assetStorage,
    }).fields([
      { name: 'featuredImage', maxCount: 1 },
      { name: 'videoFile',     maxCount: 1 },
      { name: 'images',        maxCount: 15 },
    ]);
    upload(req, res, next);
  },
  updateProperty
);

// Delete a property
router.delete('/:id', protect, adminOnly, deleteProperty);

// Manually trigger WordPress sync
router.post('/:id/publish', protect, adminOnly, publishPropertyToWordPress);

module.exports = router;
