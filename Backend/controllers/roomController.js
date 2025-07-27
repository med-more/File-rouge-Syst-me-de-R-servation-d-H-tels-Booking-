const Room = require('../models/Room');
const Hotel = require('../models/Hotel');

exports.getRooms = async (req, res) => {
  try {
    const {
      hotelId,
      type,
      minPrice,
      maxPrice,
      maxGuests,
      status,
      isAvailable,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (hotelId) {
      filter.hotelId = hotelId;
    }

    if (type) {
      filter.type = { $regex: type, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      filter.pricePerNight = {};
      if (minPrice) filter.pricePerNight.$gte = parseFloat(minPrice);
      if (maxPrice) filter.pricePerNight.$lte = parseFloat(maxPrice);
    }

    if (maxGuests) {
      filter.maxGuests = { $gte: parseInt(maxGuests) };
    }

    if (status) {
      filter.status = status;
    }

    if (isAvailable !== undefined) {
      filter.isAvailable = isAvailable === 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const rooms = await Room.find(filter)
      .populate('hotelId', 'name location')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Room.countDocuments(filter);

    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      rooms,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage,
        hasPrevPage
      },
      filters: {
        hotelId,
        type,
        minPrice,
        maxPrice,
        maxGuests,
        status,
        isAvailable
      }
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('hotelId', 'name location description amenities');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json({ room });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json({ 
      message: 'Room updated successfully',
      room 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

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

    const roomForHotel = {
      type,
      description,
      pricePerNight,
      maxGuests,
      quantity,
      amenities: amenities || [],
      images: images || []
    };

    await Hotel.findByIdAndUpdate(
      hotelId,
      { $push: { rooms: roomForHotel } }
    );

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