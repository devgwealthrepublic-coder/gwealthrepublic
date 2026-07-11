const express      = require('express');
const router       = express.Router();
const asyncHandler = require('express-async-handler');
const jwt          = require('jsonwebtoken');
const User         = require('../models/User');

// Helper — generate JWT and set HTTP-Only cookie
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });

  const cookieOptions = {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   30 * 24 * 60 * 60 * 1000, // 30 days in ms
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token,
      data: {
        _id:          user._id,
        fullName:     user.fullName,
        email:        user.email,
        role:         user.role,
        status:       user.status,
        referralCode: user.referralCode,
      },
    });
};

// ================================================================
//  @route  POST /api/auth/register
//  @desc   Realtor self-registration (status starts as 'pending')
//  @access Public
// ================================================================
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { fullName, email, phone, password, referredBy, officeLocation } = req.body;

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400);
      throw new Error('An account with this email already exists.');
    }

    const user = await User.create({
      fullName,
      email,
      phone,
      password,
      referredBy: referredBy || null,
      officeLocation,
      role:   'realtor',
      status: 'pending', // Awaits admin approval
    });

    // Send pending application email (asynchronous)
    const { sendPendingEmail } = require('../utils/emailService');
    sendPendingEmail(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Your account is pending admin verification. You will be notified once approved.',
    });
  })
);

// ================================================================
//  @route  POST /api/auth/verify-payment
//  @desc   Verify Paystack payment and activate account
//  @access Public (requires valid user email + reference)
// ================================================================
router.post(
  '/verify-payment',
  asyncHandler(async (req, res) => {
    const { reference, email, subscriptionPlan, amountPaid } = req.body;

    if (!reference || !email) {
      res.status(400);
      throw new Error('Payment reference and email are required.');
    }

    // Verify with Paystack API
    const axios = require('axios');
    try {
      const paystackRes = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      });

      if (paystackRes.data.data.status !== 'success') {
        res.status(400);
        throw new Error('Payment was not successful on Paystack.');
      }

      // Update user in DB
      const user = await User.findOne({ email });
      if (!user) {
        res.status(404);
        throw new Error('User not found.');
      }

      user.status = 'approved';
      user.subscriptionPlan = subscriptionPlan;
      user.amountPaid = amountPaid;
      user.paymentReference = reference;
      await user.save();

      // Send the Welcome Email now that they are fully approved!
      // The function signature is: sendWelcomeEmail(partnerEmail, partnerName, partnerCode)
      const { sendWelcomeEmail } = require('./../controllers/onboardingController');
      sendWelcomeEmail(user.email, user.fullName, user.referralCode);

      // Issue token and login
      sendTokenResponse(user, 200, res);

    } catch (error) {
      console.error('Paystack Verification Error:', error.response?.data || error.message);
      res.status(400);
      throw new Error('Failed to verify payment with Paystack.');
    }
  })
);

// ================================================================
//  @route  POST /api/auth/login
//  @desc   Login for realtors ONLY
//  @access Public
// ================================================================
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide both email and password.');
    }

    // Fetch user with password (select: false by default)
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error('Invalid email or password.');
    }

    if (user.role === 'admin') {
      res.status(403);
      throw new Error('Admins must use the dedicated Admin Login portal.');
    }

    // Block pending/suspended accounts from logging in
    if (user.status === 'pending') {
      res.status(403);
      throw new Error('Your account is pending admin approval. Please wait for verification.');
    }
    if (user.status === 'suspended') {
      res.status(403);
      throw new Error('Your account has been suspended. Please contact support.');
    }

    sendTokenResponse(user, 200, res);
  })
);

// ================================================================
//  @route  POST /api/auth/admin-login
//  @desc   Login explicitly for admins
//  @access Public
// ================================================================
router.post(
  '/admin-login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide both email and password.');
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error('Invalid admin email or password.');
    }

    if (user.role !== 'admin') {
      res.status(403);
      throw new Error('Access denied. You are not an administrator.');
    }

    sendTokenResponse(user, 200, res);
  })
);

// ================================================================
//  @route  POST /api/auth/logout
//  @desc   Clear the auth cookie
//  @access Private
// ================================================================
router.post('/logout', (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires:  new Date(0),
  });
  res.json({ success: true, message: 'Logged out successfully.' });
});

module.exports = router;
