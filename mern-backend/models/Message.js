const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  email: {
    type: String,
    required: [true, 'Email or Phone is required']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required']
  },
  message: {
    type: String,
    required: [true, 'Message body is required']
  },
  status: {
    type: String,
    enum: ['Unread', 'Read'],
    default: 'Unread'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);
