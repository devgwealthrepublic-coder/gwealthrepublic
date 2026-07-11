const express      = require('express');
const router       = express.Router();
const asyncHandler = require('express-async-handler');
const Visitor      = require('../models/Visitor');


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
// Note: We need a basic protect middleware check here, but if auth middleware isn't split this way, we'll just handle auth in the route if needed.
// Looking at other routes, we should use the standard protect.
router.get(
  '/',
  // protect, // Assuming protect is imported, but we'll check how auth is handled. Wait, other routes just check req.cookies.token if we have a middleware. Let's just implement the logic directly if middleware is missing.
  asyncHandler(async (req, res) => {
    // Basic auth check inline if we don't have middleware imported properly
    const token = req.cookies.token;
    if (!token) {
      res.status(401);
      throw new Error('Not authorized to access visitors');
    }

    const jwt = require('jsonwebtoken');
    const User = require('../models/User');
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user || user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized as an admin');
      }
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token failed');
    }

    const visitors = await Visitor.find().sort({ timeSubmitted: -1 });

    res.status(200).json({
      success: true,
      count: visitors.length,
      data: visitors
    });
  })
);

module.exports = router;
