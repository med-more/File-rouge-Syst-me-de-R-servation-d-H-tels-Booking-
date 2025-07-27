const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
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
  date: {
    type: Date,
    required: true,
    index: true
  },
  totalQuantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  bookedQuantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  availableQuantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  specialPrice: {
    type: Number,
    min: 0
  },
  isSpecialPrice: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['available', 'fully_booked', 'maintenance', 'blocked'],
    default: 'available'
  },
  notes: {
    type: String,
    maxlength: 500
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

availabilitySchema.index({ hotelId: 1, roomId: 1, date: 1 }, { unique: true });

availabilitySchema.index({ date: 1, isAvailable: 1 });
availabilitySchema.index({ hotelId: 1, date: 1 });

availabilitySchema.methods.calculateAvailability = function() {
  this.availableQuantity = this.totalQuantity - this.bookedQuantity;
  this.isAvailable = this.availableQuantity > 0;
  
  if (this.availableQuantity === 0) {
    this.status = 'fully_booked';
  } else if (this.availableQuantity < this.totalQuantity) {
    this.status = 'available';
  }
  
  return this;
};

availabilitySchema.methods.bookRooms = function(quantity) {
  if (this.availableQuantity >= quantity) {
    this.bookedQuantity += quantity;
    this.calculateAvailability();
    return true;
  }
  return false;
};

availabilitySchema.methods.cancelBooking = function(quantity) {
  if (this.bookedQuantity >= quantity) {
    this.bookedQuantity -= quantity;
    this.calculateAvailability();
    return true;
  }
  return false;
};

availabilitySchema.statics.upsertAvailability = async function(data) {
  const { hotelId, roomId, date, totalQuantity, price, specialPrice } = data;
  
  const availability = await this.findOneAndUpdate(
    { hotelId, roomId, date },
    {
      $set: {
        totalQuantity,
        price,
        specialPrice: specialPrice || null,
        isSpecialPrice: !!specialPrice,
        lastUpdated: new Date()
      }
    },
    { 
      new: true, 
      upsert: true,
      setDefaultsOnInsert: true
    }
  );
  
  return availability.calculateAvailability();
};

availabilitySchema.statics.checkAvailability = async function(hotelId, roomId, checkIn, checkOut) {
  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);
  
  const availabilities = await this.find({
    hotelId,
    roomId,
    date: {
      $gte: startDate,
      $lt: endDate
    }
  }).sort({ date: 1 });
  
  return availabilities;
};

availabilitySchema.statics.bookPeriod = async function(hotelId, roomId, checkIn, checkOut, quantity) {
  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);
  
  const availabilities = await this.find({
    hotelId,
    roomId,
    date: {
      $gte: startDate,
      $lt: endDate
    }
  });
  
  for (const availability of availabilities) {
    if (availability.availableQuantity < quantity) {
      throw new Error(`Insufficient availability for date ${availability.date}`);
    }
  }
  
  const updatePromises = availabilities.map(availability => {
    availability.bookRooms(quantity);
    return availability.save();
  });
  
  await Promise.all(updatePromises);
  
  return availabilities;
};

const Availability = mongoose.model('Availability', availabilitySchema);

module.exports = Availability; 