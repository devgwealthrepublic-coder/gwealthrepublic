const express      = require('express');
const router       = express.Router();
const asyncHandler = require('express-async-handler');
const Visitor      = require('../models/Visitor');
const { protect, adminOnly } = require('../middleware/auth');


// ================================================================
//  @route  POST /api/visitors/log
//  @desc   Log a new visitor from the WordPress frontend
//  @access Public
// ================================================================
router.post(
  '/log',
  asyncHandler(async (req, res) => {
    const { name, email, intent, timeSubmitted, device } = req.body;

    if (!name) {
      res.status(400);
      throw new Error('Name is required to log a visitor.');
    }

    const visitor = await Visitor.create({
      name,
      email: email || null,
      intent: intent || 'buyer',
      timeSubmitted: timeSubmitted || Date.now(),
      device
    });

    res.status(201).json({
      success: true,
      data: visitor
    });
  })
);

// ================================================================
//  @route  GET /api/visitors
//  @desc   Get all logged visitors
//  @access Private/Admin
// ================================================================
router.get(
  '/',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const visitors = await Visitor.find().sort({ timeSubmitted: -1 });

    res.status(200).json({
      success: true,
      count: visitors.length,
      data: visitors
    });
  })
);

module.exports = router;
