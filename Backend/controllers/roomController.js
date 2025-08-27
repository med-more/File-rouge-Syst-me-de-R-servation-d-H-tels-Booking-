const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const Availability = require('../models/Availability');

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

exports.getRoomAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      startDate, 
      endDate, 
      guests,
      page = 1,
      limit = 30
    } = req.query;

    const room = await Room.findById(id).populate('hotelId', 'name location');
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const dateFilter = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.$lte = new Date(endDate);
    }

    if (!startDate && !endDate) {
      const today = new Date();
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(today.getDate() + 30);
      
      dateFilter.$gte = today;
      dateFilter.$lte = thirtyDaysLater;
    }

    const filter = {
      roomId: id,
      date: dateFilter
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const availabilities = await Availability.find(filter)
      .sort({ date: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Availability.countDocuments(filter);

    const totalAvailable = availabilities.reduce((sum, av) => sum + av.availableQuantity, 0);
    const totalBooked = availabilities.reduce((sum, av) => sum + av.bookedQuantity, 0);
    const averagePrice = availabilities.length > 0 
      ? availabilities.reduce((sum, av) => sum + (av.isSpecialPrice ? av.specialPrice : av.price), 0) / availabilities.length 
      : room.pricePerNight;

    let filteredAvailabilities = availabilities;
    if (guests && parseInt(guests) > room.maxGuests) {
      filteredAvailabilities = [];
    }

    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      room: {
        _id: room._id,
        type: room.type,
        description: room.description,
        maxGuests: room.maxGuests,
        hotel: room.hotelId
      },
      availability: filteredAvailabilities.map(av => ({
        date: av.date,
        totalQuantity: av.totalQuantity,
        bookedQuantity: av.bookedQuantity,
        availableQuantity: av.availableQuantity,
        isAvailable: av.isAvailable,
        price: av.price,
        specialPrice: av.specialPrice,
        isSpecialPrice: av.isSpecialPrice,
        status: av.status,
        notes: av.notes
      })),
      statistics: {
        totalAvailable,
        totalBooked,
        averagePrice: Math.round(averagePrice * 100) / 100,
        totalDays: availabilities.length,
        occupancyRate: total > 0 ? Math.round((totalBooked / (totalAvailable + totalBooked)) * 100) : 0
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage,
        hasPrevPage
      },
      filters: {
        startDate: startDate || null,
        endDate: endDate || null,
        guests: guests ? parseInt(guests) : null
      }
    });

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
      name,
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
      name,
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
      name,
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

exports.upsertRoomAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      date,
      startDate,
      endDate,
      totalQuantity,
      price,
      specialPrice,
      notes,
      status
    } = req.body;

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    const hotelId = room.hotelId;

    const upsertOne = async (theDate) => {
      const data = {
        hotelId,
        roomId: id,
        date: new Date(theDate),
        totalQuantity: totalQuantity || room.quantity,
        price: price || room.pricePerNight,
        specialPrice,
        notes,
        status
      };
      const availability = await Availability.findOneAndUpdate(
        { hotelId, roomId: id, date: new Date(theDate) },
        { $set: data },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      availability.availableQuantity = availability.totalQuantity - availability.bookedQuantity;
      availability.isAvailable = availability.availableQuantity > 0;
      await availability.save();
      return availability;
    };

    let updated = [];
    if (date) {
      const result = await upsertOne(date);
      updated.push(result);
    } else if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const result = await upsertOne(new Date(d));
        updated.push(result);
      }
    } else {
      return res.status(400).json({ message: 'You must provide either date or startDate and endDate.' });
    }

    res.json({
      message: 'Availability upserted successfully',
      availability: updated
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 