const express = require('express');
const {
  createSubscriber,
  getSubscribers,
  deleteSubscriber
} = require('../controllers/subscriberController');

const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Public route for WordPress frontend subscription form
router.post('/subscribers', createSubscriber);

// Protected Admin routes
router.route('/subscribers')
  .get(protect, adminOnly, getSubscribers);

router.route('/subscribers/:id')
  .delete(protect, adminOnly, deleteSubscriber);

module.exports = router;
