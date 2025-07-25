const Room = require('../models/Room');
const Hotel = require('../models/Hotel');

exports.createRoom = async (req, res) => {
  try {
    const {
      hotelId,
      type,
      description,
      pricePerNight,
      maxGuests,
      quantity,
      amenities,
      images
    } = req.body;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    const room = new Room({
      hotelId,
      type,
      description,
      pricePerNight,
      maxGuests,
      quantity,
      amenities: amenities || [],
      images: images || []
    });

    await room.save();

    res.status(201).json({ 
      message: 'Room created successfully',
      room 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
}; 