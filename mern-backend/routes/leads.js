const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Lead = require('../models/Lead');
const { protect } = require('../middleware/auth');

// All lead routes require authentication
router.use(protect);

// GET /api/leads - Get all leads for the logged-in realtor
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const leads = await Lead.find({ realtor: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: leads });
  })
);

// POST /api/leads - Create a new lead
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, phone, interestLevel, notes } = req.body;

    const lead = await Lead.create({
      realtor: req.user.id,
      name,
      phone,
      interestLevel,
      notes,
    });

    res.status(201).json({ success: true, data: lead });
  })
);

// PUT /api/leads/:id - Update a lead
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      res.status(404);
      throw new Error('Lead not found');
    }

    // Ensure the lead belongs to the logged-in realtor
    if (lead.realtor.toString() !== req.user.id) {
      res.status(401);
      throw new Error('Not authorized to update this lead');
    }

    const updatedLead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: updatedLead });
  })
);

// DELETE /api/leads/:id - Delete a lead
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      res.status(404);
      throw new Error('Lead not found');
    }

    // Ensure the lead belongs to the logged-in realtor
    if (lead.realtor.toString() !== req.user.id) {
      res.status(401);
      throw new Error('Not authorized to delete this lead');
    }

    await lead.deleteOne();
    res.json({ success: true, message: 'Lead removed' });
  })
);

module.exports = router;
