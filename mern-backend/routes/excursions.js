const express = require('express');
const { getExcursions, createExcursion, updateExcursion } = require('../controllers/excursionController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, adminOnly, getExcursions)
  .post(createExcursion); // Public for WordPress integration

router.route('/:id')
  .put(protect, adminOnly, updateExcursion);

module.exports = router;
