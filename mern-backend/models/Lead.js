const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    realtor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Prospect name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Prospect phone number is required'],
      trim: true,
    },
    interestLevel: {
      type: String,
      enum: ['Hot', 'Warm', 'Cold'],
      default: 'Warm',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Lead', leadSchema);
