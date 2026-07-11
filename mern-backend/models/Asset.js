const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Asset title is required']
  },
  type: {
    type: String,
    enum: ['image', 'video', 'document'],
    required: [true, 'Asset type is required']
  },
  category: {
    type: String,
    required: [true, 'Asset category is required']
  },
  url: {
    type: String,
    required: [true, 'Asset URL is required']
  },
  size: {
    type: String,
    default: 'Unknown Size'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Asset', assetSchema);
