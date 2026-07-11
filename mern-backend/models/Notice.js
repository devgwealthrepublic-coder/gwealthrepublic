const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Notice title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notice message is required'],
    },
    type: {
      type: String,
      enum: ['info', 'urgent', 'success'],
      default: 'info',
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notice', noticeSchema);
