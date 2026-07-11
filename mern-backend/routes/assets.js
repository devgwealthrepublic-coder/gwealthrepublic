const express = require('express');
const multer = require('multer');
const { getAssets, createAsset, deleteAsset } = require('../controllers/assetController');
const { protect, adminOnly } = require('../middleware/auth');
const { assetStorage } = require('../config/cloudinary');

const router = express.Router();

const upload = multer({ storage: assetStorage });

router.route('/')
  .get(protect, getAssets) // Admin and Realtors
  .post(protect, adminOnly, upload.single('file'), createAsset);

router.route('/:id')
  .delete(protect, adminOnly, deleteAsset);

module.exports = router;
