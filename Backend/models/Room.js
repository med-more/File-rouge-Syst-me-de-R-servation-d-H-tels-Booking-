const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  type: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  pricePerNight: {
    type: Number,
    required: true,
    min: 1
  },
  maxGuests: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  amenities: [{
    type: String,
    trim: true
  }],
  images: [{
    type: String
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance', 'reserved'],
    default: 'available'
  }
}, { 
  timestamps: true 
});

roomSchema.index({ hotelId: 1, type: 1 });
roomSchema.index({ status: 1, isAvailable: 1 });

module.exports = mongoose.model('Room', roomSchema); 