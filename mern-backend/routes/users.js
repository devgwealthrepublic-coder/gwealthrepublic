const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// ================================================================
//  @route  GET /api/users
//  @desc   Get all users (for Admin to manage partners)
//  @access Admin only
// ================================================================
router.get(
  '/',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  })
);

// ================================================================
//  @route  PUT /api/users/:id/status
//  @desc   Update user status (approve/reject partners)
//  @access Admin only
// ================================================================
router.put(
  '/:id/status',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const previousStatus = user.status;
    user.status = status;
    await user.save();

    // If approved, send the onboarding welcome email
    if (status === 'approved' && previousStatus !== 'approved') {
      const { sendWelcomeEmail } = require('../controllers/onboardingController');
      sendWelcomeEmail(user.email, user.fullName, user.referralCode);
    }
    
    res.json({
      success: true,
      message: `User status updated to ${status}`,
      data: user,
    });
  })
);

module.exports = router;
