const asyncHandler = require('express-async-handler');
const Subscriber = require('../models/Subscriber');

// ================================================================
//  @route  POST /api/subscribers
//  @desc   Submit a new email for newsletter subscription
//  @access Public
// ================================================================
const createSubscriber = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Please provide an email address');
  }

  // Check if email already exists
  const existingSubscriber = await Subscriber.findOne({ email: email.toLowerCase() });
  
  if (existingSubscriber) {
    // Even if it exists, return success to the user so they don't get an error
    return res.status(200).json({
      success: true,
      message: 'You are already subscribed!'
    });
  }

  const newSubscriber = await Subscriber.create({ email });

  res.status(201).json({
    success: true,
    message: 'Successfully subscribed to the newsletter!',
    data: newSubscriber
  });
});

// ================================================================
//  @route  GET /api/subscribers
//  @desc   Get all subscribers
//  @access Private (Admin)
// ================================================================
const getSubscribers = asyncHandler(async (req, res) => {
  const subscribers = await Subscriber.find().sort({ createdAt: -1 });
  res.json({
    success: true,
    count: subscribers.length,
    data: subscribers
  });
});

// ================================================================
//  @route  DELETE /api/subscribers/:id
//  @desc   Delete a subscriber
//  @access Private (Admin)
// ================================================================
const deleteSubscriber = asyncHandler(async (req, res) => {
  const subscriber = await Subscriber.findById(req.params.id);

  if (!subscriber) {
    res.status(404);
    throw new Error('Subscriber not found');
  }

  await subscriber.deleteOne();

  res.json({
    success: true,
    message: 'Subscriber removed successfully'
  });
});

module.exports = {
  createSubscriber,
  getSubscribers,
  deleteSubscriber
};
