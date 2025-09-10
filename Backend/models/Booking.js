const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true,
    index: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
    index: true
  },

  checkIn: {
    type: Date,
    required: true,
    index: true
  },
  checkOut: {
    type: Date,
    required: true,
    index: true
  },
  numberOfNights: {
    type: Number,
    required: true,
    min: 1
  },

  guests: {
    adults: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    children: {
      type: Number,
      default: 0,
      min: 0
    },
    infants: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  guestDetails: {
    primaryGuest: {
      firstName: String,
      lastName: String,
      email: String,
      phone: String
    },
    additionalGuests: [{
      firstName: String,
      lastName: String,
      age: Number
    }]
  },

  pricePerNight: {
    type: Number,
    required: true,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  taxes: {
    type: Number,
    default: 0
  },
  fees: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  finalPrice: {
    type: Number,
    required: true,
    min: 0
  },

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
    default: 'pending',
    index: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending',
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash'],
    required: true
  },
  paymentId: {
    type: String
  },

  specialRequests: {
    type: String,
    maxlength: 1000
  },
  roomPreferences: [{
    type: String,
    enum: ['high_floor', 'low_floor', 'quiet_room', 'connecting_rooms', 'accessible_room', 'non_smoking']
  }],

  // Annulation
  cancellationPolicy: {
    type: String,
    enum: ['free_cancellation', 'partial_refund', 'no_refund'],
    default: 'free_cancellation'
  },
  cancellationDeadline: {
    type: Date
  },
  cancellationReason: {
    type: String,
    maxlength: 500
  },

  source: {
    type: String,
    enum: ['website', 'mobile_app', 'phone', 'travel_agent', 'partner'],
    default: 'website'
  },
  ipAddress: String,
  userAgent: String,

  emailSent: {
    type: Boolean,
    default: false
  },
  smsSent: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  confirmedAt: Date,
  cancelledAt: Date,
  completedAt: Date
}, {
  timestamps: true
});

bookingSchema.index({ hotelId: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ status: 1, paymentStatus: 1 });
bookingSchema.index({ checkIn: 1, status: 1 });

bookingSchema.statics.generateBookingNumber = async function() {
  const prefix = 'BK';
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  const bookingNumber = `${prefix}${year}${month}${day}${random}`;
  
  const existing = await this.findOne({ bookingNumber });
  if (existing) {
    return this.generateBookingNumber(); 
  }
  
  return bookingNumber;
};

bookingSchema.methods.calculateTotalPrice = function() {
  const basePrice = this.pricePerNight * this.numberOfNights;
  const subtotal = basePrice + this.taxes + this.fees;
  this.totalPrice = subtotal;
  this.finalPrice = subtotal - this.discount;
  return this.finalPrice;
};

bookingSchema.methods.calculateNights = function() {
  const checkIn = new Date(this.checkIn);
  const checkOut = new Date(this.checkOut);
  const diffTime = checkOut - checkIn;
  this.numberOfNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return this.numberOfNights;
};

bookingSchema.methods.getTotalGuests = function() {
  return this.guests.adults + this.guests.children + this.guests.infants;
};

bookingSchema.methods.canBeCancelled = function() {
  if (this.status === 'cancelled') {
    return {
      canCancel: false,
      reason: 'Booking is already cancelled'
    };
  }
  
  if (this.status === 'completed') {
    return {
      canCancel: false,
      reason: 'Cannot cancel completed bookings'
    };
  }
  
  const now = new Date();
  const checkIn = new Date(this.checkIn);
  const daysUntilCheckIn = Math.ceil((checkIn - now) / (1000 * 60 * 60 * 24));
  
  switch (this.cancellationPolicy) {
    case 'free_cancellation':
      return {
        canCancel: true,
        reason: 'Free cancellation available',
        deadline: checkIn
      };
      
    case 'partial_refund':
      if (daysUntilCheckIn <= 0) {
        return {
          canCancel: false,
          reason: 'Cancellation deadline has passed',
          deadline: checkIn
        };
      } else if (daysUntilCheckIn <= 1) {
        return {
          canCancel: true,
          reason: 'Cancellation allowed with 50% fee',
          deadline: checkIn,
          fee: this.finalPrice * 0.5
        };
      } else if (daysUntilCheckIn <= 2) {
        return {
          canCancel: true,
          reason: 'Cancellation allowed with 25% fee',
          deadline: checkIn,
          fee: this.finalPrice * 0.25
        };
      } else {
        return {
          canCancel: true,
          reason: 'Free cancellation available',
          deadline: checkIn
        };
      }
      
    case 'no_refund':
      if (daysUntilCheckIn <= 3) {
        return {
          canCancel: false,
          reason: 'No cancellation allowed within 72 hours',
          deadline: new Date(checkIn.getTime() - (3 * 24 * 60 * 60 * 1000))
        };
      } else {
        return {
          canCancel: true,
          reason: 'Cancellation allowed with 10% fee',
          deadline: new Date(checkIn.getTime() - (3 * 24 * 60 * 60 * 1000)),
          fee: this.finalPrice * 0.1
        };
      }
      
    default:
      return {
        canCancel: true,
        reason: 'Cancellation available',
        deadline: checkIn
      };
  }
};

bookingSchema.methods.cancelBooking = function(reason = '') {
  const cancellationCheck = this.canBeCancelled();
  if (!cancellationCheck.canCancel) {
    throw new Error(cancellationCheck.reason);
  }
  
  this.status = 'cancelled';
  this.cancellationReason = reason;
  this.cancelledAt = new Date();
  
  return this;
};

bookingSchema.methods.confirmBooking = function() {
  this.status = 'confirmed';
  this.confirmedAt = new Date();
  return this;
};

bookingSchema.methods.completeBooking = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this;
};

bookingSchema.pre('save', function(next) {
  if (this.isModified('checkIn') || this.isModified('checkOut')) {
    this.calculateNights();
  }
  
  if (this.isModified('pricePerNight') || this.isModified('numberOfNights') || 
      this.isModified('taxes') || this.isModified('fees') || this.isModified('discount')) {
    this.calculateTotalPrice();
  }
  
  this.updatedAt = new Date();
  next();
});

bookingSchema.statics.checkAvailability = async function(hotelId, roomId, checkIn, checkOut, guests = 1) {
  const Availability = mongoose.model('Availability');
  
  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);
  
  const availabilities = await Availability.find({
    hotelId,
    roomId,
    date: {
      $gte: startDate,
      $lt: endDate
    }
  });
  
  // Vérifier si toutes les dates ont suffisamment de disponibilité
  for (const availability of availabilities) {
    if (availability.availableQuantity < guests) {
      return {
        available: false,
        reason: `Insufficient availability for ${availability.date.toDateString()}`,
        date: availability.date
      };
    }
  }
  
  return { available: true, availabilities };
};

bookingSchema.statics.createBooking = async function(bookingData) {
  try {
    console.log('Creating booking with data:', bookingData)
    
    const { hotelId, roomId, checkIn, checkOut, guests } = bookingData;
    
    const availabilityCheck = await this.checkAvailability(hotelId, roomId, checkIn, checkOut, guests.adults);
    if (!availabilityCheck.available) {
      throw new Error(availabilityCheck.reason);
    }
    
    const bookingNumber = await this.generateBookingNumber();
    console.log('Generated booking number:', bookingNumber)
    
    const booking = new this({
      ...bookingData,
      bookingNumber
    });
    
    console.log('Booking instance created, attempting to save...')
    await booking.save();
    console.log('Booking saved successfully')
    
    const Availability = mongoose.model('Availability');
    await Availability.bookPeriod(hotelId, roomId, checkIn, checkOut, guests.adults);
    
    return booking;
  } catch (error) {
    console.error('Error in createBooking:', error)
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors)
    }
    throw error
  }
};

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
