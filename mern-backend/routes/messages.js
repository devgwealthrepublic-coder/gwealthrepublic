const express = require('express');
const {
  createMessage,
  getMessages,
  updateMessageStatus,
  deleteMessage
} = require('../controllers/messageController');

const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Public route for WordPress frontend form submission
router.post('/contact', createMessage);

// Protected Admin routes
router.route('/messages')
  .get(protect, adminOnly, getMessages);

router.route('/messages/:id')
  .put(protect, adminOnly, updateMessageStatus)
  .delete(protect, adminOnly, deleteMessage);

module.exports = router;
