const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const multer = require('multer');

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
//  @route  GET /api/users/me
//  @desc   Get current logged-in user profile
//  @access Private
// ================================================================
router.get(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    res.json({ success: true, data: user });
  })
);

// ================================================================
//  @route  GET /api/users/downline
//  @desc   Get the downline network for the logged-in realtor
//  @access Private
// ================================================================
router.get(
  '/downline',
  protect,
  asyncHandler(async (req, res) => {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser || !currentUser.referralCode) {
      res.status(400);
      throw new Error('User or referral code not found');
    }

    // Level 1: Direct Recruits
    const level1 = await User.find({ referredBy: currentUser.referralCode })
      .select('fullName email phone officeLocation status createdAt referralCode')
      .sort({ createdAt: -1 })
      .lean();

    // Level 2: Indirect Recruits
    const level1Codes = level1.map((u) => u.referralCode).filter(Boolean);
    const level2 = await User.find({ referredBy: { $in: level1Codes } })
      .select('fullName email phone officeLocation status createdAt referralCode referredBy')
      .sort({ createdAt: -1 })
      .lean();

    // Structure the tree
    const networkTree = level1.map((l1User) => {
      const recruits = level2.filter((l2User) => l2User.referredBy === l1User.referralCode);
      return {
        ...l1User,
        recruits,
      };
    });

    res.json({ success: true, data: networkTree });
  })
);

// ================================================================
//  @route  PUT /api/users/profile
//  @desc   Update user profile (bio, phone, location, profile picture)
//  @access Private
// ================================================================
router.put(
  '/profile',
  protect,
  (req, res, next) => {
    const upload = multer({
      storage: require('../config/cloudinary').assetStorage,
    }).single('profilePicture');
    upload(req, res, next);
  },
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.fullName = req.body.fullName || user.fullName;
    user.phone = req.body.phone || user.phone;
    user.officeLocation = req.body.officeLocation || user.officeLocation;
    user.bio = req.body.bio || user.bio;

    if (req.body.password) {
      user.password = req.body.password; // Pre-save hook handles hashing
    }

    if (req.file && req.file.path) {
      user.profilePicture = req.file.path;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        officeLocation: updatedUser.officeLocation,
        bio: updatedUser.bio,
        profilePicture: updatedUser.profilePicture,
      },
    });
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
