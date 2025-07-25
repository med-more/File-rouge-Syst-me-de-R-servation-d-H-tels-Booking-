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
