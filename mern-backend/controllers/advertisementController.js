const Advertisement = require('../models/Advertisement');

// @desc    Get the active advertisement (For public WordPress frontend)
// @route   GET /api/advertisements/active
// @access  Public
exports.getActiveAdvertisement = async (req, res) => {
  try {
    // There should only be one active at a time, but we take the latest
    const ad = await Advertisement.findOne({ isActive: true }).sort({ updatedAt: -1 });
    
    if (!ad) {
      return res.status(200).json({ success: true, data: null });
    }

    res.status(200).json({ success: true, data: ad });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all advertisements (Admin only)
// @route   GET /api/advertisements
// @access  Private/Admin
exports.getAdvertisements = async (req, res) => {
  try {
    const ads = await Advertisement.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: ads });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create an advertisement
// @route   POST /api/advertisements
// @access  Private/Admin
exports.createAdvertisement = async (req, res) => {
  try {
    const { title, actionUrl, isActive } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a flyer image' });
    }

    // If this new one is active, deactivate others
    if (isActive === 'true' || isActive === true) {
      await Advertisement.updateMany({}, { isActive: false });
    }

    const ad = await Advertisement.create({
      title,
      actionUrl,
      imageUrl: req.file.path, // Cloudinary URL
      isActive: isActive === 'true' || isActive === true,
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, data: ad });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: 'Invalid data' });
  }
};

// @desc    Update advertisement status (Toggle Active/Inactive)
// @route   PUT /api/advertisements/:id
// @access  Private/Admin
exports.updateAdvertisement = async (req, res) => {
  try {
    const { isActive } = req.body;
    const ad = await Advertisement.findById(req.params.id);

    if (!ad) {
      return res.status(404).json({ success: false, message: 'Ad not found' });
    }

    // If activating, deactivate all others first
    if (isActive) {
      await Advertisement.updateMany({}, { isActive: false });
    }

    ad.isActive = isActive;
    await ad.save();

    res.status(200).json({ success: true, data: ad });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Invalid data' });
  }
};

// @desc    Delete an advertisement
// @route   DELETE /api/advertisements/:id
// @access  Private/Admin
exports.deleteAdvertisement = async (req, res) => {
  try {
    const ad = await Advertisement.findByIdAndDelete(req.params.id);
    if (!ad) return res.status(404).json({ success: false, message: 'Ad not found' });
    
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
