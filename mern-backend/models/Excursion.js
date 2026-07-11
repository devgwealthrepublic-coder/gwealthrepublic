const mongoose = require('mongoose');

const excursionSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: [true, 'Client name is required']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  property: {
    type: String,
    required: [true, 'Property name is required']
  },
  branch: {
    type: String,
    enum: ['Aba', 'Asaba', 'Port Harcourt', 'Abuja', 'Anambra'],
    required: [true, 'Branch is required']
  },
  preferredDate: {
    type: Date,
    required: [true, 'Preferred date is required']
  },
  coordinator: {
    type: String,
    default: 'Unassigned'
  },
  status: {
    type: String,
    enum: ['pending', 'scheduled', 'completed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Excursion', excursionSchema);
