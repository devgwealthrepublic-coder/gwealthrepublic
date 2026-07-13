const express = require('express');
const multer = require('multer');
const { 
  getActiveAdvertisement, 
  getAdvertisements, 
  createAdvertisement, 
  updateAdvertisement, 
  deleteAdvertisement 
} = require('../controllers/advertisementController');
const { protect, adminOnly } = require('../middleware/auth');
const { assetStorage } = require('../config/cloudinary');

const router = express.Router();
const upload = multer({ storage: assetStorage });

router.get('/active', getActiveAdvertisement); // Public

router.route('/')
  .get(protect, adminOnly, getAdvertisements)
  .post(protect, adminOnly, upload.single('file'), createAdvertisement);

router.route('/:id')
  .put(protect, adminOnly, updateAdvertisement)
  .delete(protect, adminOnly, deleteAdvertisement);

module.exports = router;
