const Excursion = require('../models/Excursion');

// @desc    Get all excursions
// @route   GET /api/excursions
// @access  Private (Admin)
exports.getExcursions = async (req, res) => {
  try {
    const excursions = await Excursion.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: excursions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create an excursion
// @route   POST /api/excursions
// @access  Public
exports.createExcursion = async (req, res) => {
  try {
    const excursion = await Excursion.create(req.body);
    res.status(201).json({ success: true, data: excursion });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: 'Invalid data' });
  }
};

// @desc    Update an excursion
// @route   PUT /api/excursions/:id
// @access  Private (Admin)
exports.updateExcursion = async (req, res) => {
  try {
    const excursion = await Excursion.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!excursion) {
      return res.status(404).json({ success: false, message: 'Excursion not found' });
    }

    res.status(200).json({ success: true, data: excursion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
