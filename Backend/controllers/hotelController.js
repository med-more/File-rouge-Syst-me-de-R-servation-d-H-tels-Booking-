const Hotel = require('../models/Hotel');
const Room = require('../models/Room');

exports.createHotel = async (req, res) => {
  try {
    const { name, location, description, pricePerNight, rating, amenities, images, rooms } = req.body;
    const hotel = new Hotel({
      name,
      location,
      description,
      pricePerNight,
      rating,
      amenities,
      images,
      rooms
    });
    await hotel.save();
    res.status(201).json({ hotel });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getHotels = async (req, res) => {
  try {
    const { name, location, minPrice, maxPrice, rating, amenities } = req.query;
    const filter = {};
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (minPrice || maxPrice) filter.pricePerNight = {};
    if (minPrice) filter.pricePerNight.$gte = Number(minPrice);
    if (maxPrice) filter.pricePerNight.$lte = Number(maxPrice);
    if (rating) filter.rating = Number(rating);
    if (amenities) {
      const amArr = Array.isArray(amenities) ? amenities : amenities.split(',');
      filter.amenities = { $all: amArr };
    }
    const hotels = await Hotel.find(filter);
    res.json({ hotels });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    res.json({ hotel });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateHotel = async (req, res) => {
  try {
    const { name, location, description, pricePerNight, rating, amenities, images, rooms } = req.body;
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { name, location, description, pricePerNight, rating, amenities, images, rooms },
      { new: true, runValidators: true }
    );
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    res.json({ hotel });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    res.json({ message: 'Hotel deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.searchHotels = async (req, res) => {
  try {
    const { name, location, minPrice, maxPrice, rating, amenities, roomType, minGuests } = req.query;
    const filter = {};
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (minPrice || maxPrice) filter.pricePerNight = {};
    if (minPrice) filter.pricePerNight.$gte = Number(minPrice);
    if (maxPrice) filter.pricePerNight.$lte = Number(maxPrice);
    if (rating) filter.rating = Number(rating);
    if (amenities) {
      const amArr = Array.isArray(amenities) ? amenities : amenities.split(',');
      filter.amenities = { $all: amArr };
    }
    if (roomType || minGuests) {
      filter.rooms = { $elemMatch: {} };
      if (roomType) filter.rooms.$elemMatch.type = { $regex: roomType, $options: 'i' };
      if (minGuests) filter.rooms.$elemMatch.maxGuests = { $gte: Number(minGuests) };
    }
    const hotels = await Hotel.find(filter);
    res.json({ hotels });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getHotelRooms = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    
    const rooms = await Room.find({ hotelId: req.params.id });
    
    res.json({ rooms });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getHotelAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut, guests } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({ 
        message: 'Check-in and check-out dates are required' 
      });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(checkIn) || !dateRegex.test(checkOut)) {
      return res.status(400).json({ 
        message: 'Invalid date format. Use YYYY-MM-DD' 
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ 
        message: 'Check-out date must be after check-in date' 
      });
    }

    if (checkInDate < new Date()) {
      return res.status(400).json({ 
        message: 'Check-in date cannot be in the past' 
      });
    }

    const hotel = await Hotel.findById(id);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }


    const availability = hotel.rooms.map(room => ({
      type: room.type,
      description: room.description,
      pricePerNight: room.pricePerNight,
      maxGuests: room.maxGuests,
      availableQuantity: room.quantity, 
      totalQuantity: room.quantity,
      isAvailable: room.quantity > 0 && (!guests || room.maxGuests >= parseInt(guests))
    }));

    const filteredAvailability = guests 
      ? availability.filter(room => room.maxGuests >= parseInt(guests))
      : availability;

    res.json({
      hotelId: id,
      hotelName: hotel.name,
      checkIn,
      checkOut,
      guests: guests ? parseInt(guests) : null,
      availability: filteredAvailability,
      totalAvailableRooms: filteredAvailability.reduce((sum, room) => sum + room.availableQuantity, 0)
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
