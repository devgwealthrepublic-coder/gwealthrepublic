const mongoose = require('mongoose');

const advertisementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Advertisement title is required'],
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Flyer image is required'],
    },
    actionUrl: {
      type: String,
      default: '', // Optional URL the flyer links to
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Advertisement', advertisementSchema);
