const Asset = require('../models/Asset');

// @desc    Get all assets
// @route   GET /api/assets
// @access  Private
exports.getAssets = async (req, res) => {
  try {
    const assets = await Asset.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: assets });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create/Upload an asset
// @route   POST /api/assets
// @access  Private (Admin)
exports.createAsset = async (req, res) => {
  try {
    const { title, type, category } = req.body;
    let { size } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    // Auto-calculate size if not provided
    if (!size || size === 'Unknown Size' || size.trim() === '') {
      const bytes = req.file.size;
      if (bytes < 1024 * 1024) {
        size = (bytes / 1024).toFixed(1) + ' KB';
      } else {
        size = (bytes / (1024 * 1024)).toFixed(2) + ' MB';
      }
    }

    const assetData = {
      title,
      type,
      category,
      url: req.file.path, // The Cloudinary URL
      size
    };

    const asset = await Asset.create(assetData);
    res.status(201).json({ success: true, data: asset });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: 'Invalid data' });
  }
};

// @desc    Delete an asset
// @route   DELETE /api/assets/:id
// @access  Private (Admin)
exports.deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
