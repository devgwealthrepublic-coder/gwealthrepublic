const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    default: null,
    trim: true,
    lowercase: true
  },
  intent: { 
    type: String, 
    enum: ['buyer', 'partner'], 
    default: 'buyer' 
  },
  timeSubmitted: { 
    type: Date, 
    default: Date.now 
  },
  device: { 
    type: String 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Visitor', visitorSchema);
