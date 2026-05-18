const mongoose = require('mongoose');

const QuoteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true
  },
  service: {
    type: String,
    required: [true, 'Service type is required'],
    trim: true
  },
  message: {
    type: String,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Quote', QuoteSchema);
