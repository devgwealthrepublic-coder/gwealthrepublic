const asyncHandler = require('express-async-handler');
const Message = require('../models/Message');

// ================================================================
//  @route  POST /api/contact
//  @desc   Submit a new message from WordPress frontend
//  @access Public
// ================================================================
const createMessage = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  const newMessage = await Message.create({
    name,
    email,
    subject,
    message,
    status: 'Unread'
  });

  res.status(201).json({
    success: true,
    message: 'Message sent successfully',
    data: newMessage
  });
});

// ================================================================
//  @route  GET /api/messages
//  @desc   Get all messages (inbox)
//  @access Private (Admin)
// ================================================================
const getMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find().sort({ createdAt: -1 });
  res.json({
    success: true,
    data: messages
  });
});

// ================================================================
//  @route  PUT /api/messages/:id
//  @desc   Update message status (e.g., mark as Read)
//  @access Private (Admin)
// ================================================================
const updateMessageStatus = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }

  message.status = req.body.status || 'Read';
  await message.save();

  res.json({
    success: true,
    message: 'Message status updated',
    data: message
  });
});

// ================================================================
//  @route  DELETE /api/messages/:id
//  @desc   Delete a message
//  @access Private (Admin)
// ================================================================
const deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }

  await message.deleteOne();

  res.json({
    success: true,
    message: 'Message deleted successfully'
  });
});

module.exports = {
  createMessage,
  getMessages,
  updateMessageStatus,
  deleteMessage
};
