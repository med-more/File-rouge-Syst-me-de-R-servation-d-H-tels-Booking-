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
    enum: ['single', 'double', 'triple', 'suite', 'family', 'deluxe', 'presidential']
  },
  name: {
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
    min: 0
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
    min: 1,
    default: 1
  },
  amenities: [{
    type: String,
    enum: [
      'wifi',
      'tv',
      'air_conditioning',
      'heating',
      'minibar',
      'safe',
      'balcony',
      'ocean_view',
      'mountain_view',
      'city_view',
      'garden_view',
      'kitchen',
      'living_room',
      'bathroom',
      'shower',
      'bathtub',
      'hair_dryer',
      'towels',
      'bedding',
      'desk',
      'wardrobe',
      'telephone',
      'alarm_clock',
      'coffee_maker',
      'iron',
      'ironing_board',
      'laundry_service',
      'room_service',
      'breakfast_included',
      'free_cancellation',
      'non_smoking',
      'accessible',
      'connecting_rooms',
      'adjoining_rooms'
    ]
  }],
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: 'Room image'
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  size: {
    type: Number, // en mètres carrés
    min: 0
  },
  floor: {
    type: Number,
    min: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'cleaning'],
    default: 'active'
  },
  specialFeatures: [{
    type: String,
    trim: true
  }],
  cancellationPolicy: {
    type: String,
    enum: ['flexible', 'moderate', 'strict', 'non_refundable'],
    default: 'moderate'
  },
  checkInTime: {
    type: String,
    default: '15:00'
  },
  checkOutTime: {
    type: String,
    default: '11:00'
  },
  lastCleaned: {
    type: Date,
    default: Date.now
  },
  nextCleaning: {
    type: Date
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances
roomSchema.index({ hotelId: 1, type: 1 });
roomSchema.index({ hotelId: 1, status: 1 });
roomSchema.index({ hotelId: 1, isAvailable: 1 });
roomSchema.index({ pricePerNight: 1 });

// Méthodes statiques
roomSchema.statics.findByHotel = function(hotelId) {
  return this.find({ hotelId, status: 'active' });
};

roomSchema.statics.findAvailable = function(hotelId, checkIn, checkOut) {
  return this.find({
    hotelId,
    status: 'active',
    isAvailable: true
  });
};

// Méthodes d'instance
roomSchema.methods.updateAvailability = function(isAvailable) {
  this.isAvailable = isAvailable;
  return this.save();
};

roomSchema.methods.updateStatus = function(status) {
  this.status = status;
  return this.save();
};

roomSchema.methods.addImage = function(imageUrl, alt = 'Room image', isPrimary = false) {
  if (isPrimary) {
    // Désactiver les autres images primaires
    this.images.forEach(img => img.isPrimary = false);
  }
  
  this.images.push({
    url: imageUrl,
    alt,
    isPrimary
  });
  
  return this.save();
};

roomSchema.methods.removeImage = function(imageUrl) {
  this.images = this.images.filter(img => img.url !== imageUrl);
  return this.save();
};

// Middleware pre-save pour s'assurer qu'il n'y a qu'une seule image primaire
roomSchema.pre('save', function(next) {
  const primaryImages = this.images.filter(img => img.isPrimary);
  if (primaryImages.length > 1) {
    // Garder seulement la première comme primaire
    this.images.forEach((img, index) => {
      if (index > 0) img.isPrimary = false;
    });
  }
  next();
});

// Virtual pour calculer le prix total pour X nuits
roomSchema.virtual('calculatePrice').get(function() {
  return function(nights) {
    return this.pricePerNight * nights;
  };
});

// Configuration pour inclure les virtuals dans la sérialisation JSON
roomSchema.set('toJSON', { virtuals: true });
roomSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Room', roomSchema); 