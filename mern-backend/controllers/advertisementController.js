const Advertisement = require('../models/Advertisement');

// @desc    Get the active advertisements (For public WordPress frontend)
// @route   GET /api/advertisements/active
// @access  Public
exports.getActiveAdvertisement = async (req, res) => {
  try {
    // Return all active advertisements
    const ads = await Advertisement.find({ isActive: true }).sort({ updatedAt: -1 });
    
    if (!ads || ads.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    res.status(200).json({ success: true, data: ads });
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
