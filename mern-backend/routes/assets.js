const express = require('express');
const { getAssets, createAsset, deleteAsset } = require('../controllers/assetController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, getAssets) // Admin and Realtors
  .post(protect, adminOnly, createAsset);

router.route('/:id')
  .delete(protect, adminOnly, deleteAsset);

module.exports = router;
