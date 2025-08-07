const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  type: { type: String, required: true },
  description: { type: String },
  pricePerNight: { type: Number, required: true },
  maxGuests: { type: Number, required: true },
  quantity: { type: Number, required: true },
}, { _id: false });

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  pricePerNight: { type: Number, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  amenities: [{ type: String }],
  images: [{ type: String }],
  rooms: [roomSchema],
  status: {
    type: String,
    enum: ['active', 'pending', 'inactive'],
    default: 'active',
  },
}, { timestamps: true });

module.exports = mongoose.model('Hotel', hotelSchema);



