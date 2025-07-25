const Hotel = require('../models/Hotel');

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
