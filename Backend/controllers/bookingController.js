const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const Availability = require('../models/Availability');
const mongoose = require('mongoose');

exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate('hotelId', 'name location description amenities')
      .populate('roomId', 'type description pricePerNight maxGuests amenities images')
      .populate('userId', 'name email phone');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Debug logs
    console.log('req.user.userId:', req.user.userId);
    console.log('booking.userId:', booking.userId);
    console.log('booking.userId.toString():', booking.userId.toString());
    console.log('Types:', typeof req.user.userId, typeof booking.userId.toString());

  
    const userObjectId = new mongoose.Types.ObjectId(req.user.userId);
    const bookingUserObjectId = new mongoose.Types.ObjectId(booking.userId);
    
    if (!userObjectId.equals(bookingUserObjectId)) {
      return res.status(403).json({ 
        message: 'Access denied. You can only view your own bookings.',
        debug: {
          reqUserId: req.user.userId,
          bookingUserId: booking.userId.toString(),
          userObjectId: userObjectId.toString(),
          bookingUserObjectId: bookingUserObjectId.toString(),
          types: {
            reqUserId: typeof req.user.userId,
            bookingUserId: typeof booking.userId.toString()
          }
        }
      });
    }

    const now = new Date();
    const checkInDate = new Date(booking.checkIn);
    const checkOutDate = new Date(booking.checkOut);
    
    const isUpcoming = checkInDate > now;
    const isActive = checkInDate <= now && checkOutDate > now;
    const isPast = checkOutDate <= now;
    const canBeCancelled = booking.canBeCancelled();

    res.json({
      booking: {
        _id: booking._id,
        bookingNumber: booking.bookingNumber,
        hotel: booking.hotelId,
        room: booking.roomId,
        user: booking.userId,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        numberOfNights: booking.numberOfNights,
        guests: booking.guests,
        guestDetails: booking.guestDetails,
        pricePerNight: booking.pricePerNight,
        totalPrice: booking.totalPrice,
        taxes: booking.taxes,
        fees: booking.fees,
        discount: booking.discount,
        finalPrice: booking.finalPrice,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        paymentMethod: booking.paymentMethod,
        specialRequests: booking.specialRequests,
        roomPreferences: booking.roomPreferences,
        cancellationPolicy: booking.cancellationPolicy,
        cancellationDeadline: booking.cancellationDeadline,
        cancellationReason: booking.cancellationReason,
        source: booking.source,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        confirmedAt: booking.confirmedAt,
        cancelledAt: booking.cancelledAt,
        completedAt: booking.completedAt
      },
      timeline: {
        isUpcoming,
        isActive,
        isPast,
        canBeCancelled,
        daysUntilCheckIn: isUpcoming ? Math.ceil((checkInDate - now) / (1000 * 60 * 60 * 24)) : null,
        daysUntilCheckOut: isActive ? Math.ceil((checkOutDate - now) / (1000 * 60 * 60 * 24)) : null,
        daysSinceCheckOut: isPast ? Math.ceil((now - checkOutDate) / (1000 * 60 * 60 * 24)) : null
      },
      actions: {
        canCancel: canBeCancelled,
        canModify: booking.status === 'pending' || booking.status === 'confirmed',
        canPay: booking.paymentStatus === 'pending',
        canReview: isPast && booking.status === 'completed'
      }
    });

  } catch (error) {
    console.error('Get booking by ID error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      status,
      paymentStatus,
      checkIn,
      checkOut,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    if (req.user.userId !== userId) {
      return res.status(403).json({ message: 'Access denied. You can only view your own bookings.' });
    }

    const filter = { userId };

    if (status) {
      filter.status = status;
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    if (checkIn || checkOut) {
      filter.checkIn = {};
      if (checkIn) {
        filter.checkIn.$gte = new Date(checkIn);
      }
      if (checkOut) {
        filter.checkIn.$lte = new Date(checkOut);
      }
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(filter)
      .populate('hotelId', 'name location')
      .populate('roomId', 'type description pricePerNight')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filter);

    const totalBookings = await Booking.countDocuments({ userId });
    const confirmedBookings = await Booking.countDocuments({ userId, status: 'confirmed' });
    const cancelledBookings = await Booking.countDocuments({ userId, status: 'cancelled' });
    const completedBookings = await Booking.countDocuments({ userId, status: 'completed' });
    const pendingBookings = await Booking.countDocuments({ userId, status: 'pending' });

    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      bookings: bookings.map(booking => ({
        _id: booking._id,
        bookingNumber: booking.bookingNumber,
        hotel: booking.hotelId,
        room: booking.roomId,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        numberOfNights: booking.numberOfNights,
        guests: booking.guests,
        guestDetails: booking.guestDetails,
        pricePerNight: booking.pricePerNight,
        totalPrice: booking.totalPrice,
        taxes: booking.taxes,
        fees: booking.fees,
        discount: booking.discount,
        finalPrice: booking.finalPrice,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        paymentMethod: booking.paymentMethod,
        specialRequests: booking.specialRequests,
        roomPreferences: booking.roomPreferences,
        cancellationPolicy: booking.cancellationPolicy,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        confirmedAt: booking.confirmedAt,
        cancelledAt: booking.cancelledAt,
        completedAt: booking.completedAt
      })),
      statistics: {
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        completedBookings,
        pendingBookings,
        confirmationRate: totalBookings > 0 ? Math.round((confirmedBookings / totalBookings) * 100) : 0,
        cancellationRate: totalBookings > 0 ? Math.round((cancelledBookings / totalBookings) * 100) : 0
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
        status,
        paymentStatus,
        checkIn,
        checkOut
      }
    });

  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const {
      hotelId,
      roomId,
      checkIn,
      checkOut,
      guests,
      guestDetails,
      pricePerNight,
      taxes = 0,
      fees = 0,
      discount = 0,
      paymentMethod,
      specialRequests,
      roomPreferences,
      cancellationPolicy = 'free_cancellation',
      source = 'website',
      ipAddress,
      userAgent
    } = req.body;

    const userId = req.user.userId; 

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    const room = await Room.findOne({ _id: roomId, hotelId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found or does not belong to this hotel' });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      return res.status(400).json({ message: 'Check-in date cannot be in the past' });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }

    const totalGuests = guests.adults + guests.children + guests.infants;
    if (totalGuests > room.maxGuests) {
      return res.status(400).json({ 
        message: `Maximum ${room.maxGuests} guests allowed for this room type` 
      });
    }

    const availabilityCheck = await Booking.checkAvailability(
      hotelId, 
      roomId, 
      checkIn, 
      checkOut, 
      guests.adults
    );

    if (!availabilityCheck.available) {
      return res.status(400).json({ 
        message: availabilityCheck.reason 
      });
    }

    const numberOfNights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    const basePrice = pricePerNight * numberOfNights;
    const subtotal = basePrice + taxes + fees;
    const finalPrice = subtotal - discount;

    const bookingData = {
      userId,
      hotelId,
      roomId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      numberOfNights,
      guests,
      guestDetails,
      pricePerNight,
      totalPrice: subtotal,
      taxes,
      fees,
      discount,
      finalPrice,
      paymentMethod,
      specialRequests,
      roomPreferences,
      cancellationPolicy,
      source,
      ipAddress,
      userAgent
    };

    const booking = await Booking.createBooking(bookingData);

    await booking.populate([
      { path: 'hotelId', select: 'name location' },
      { path: 'roomId', select: 'type description' },
      { path: 'userId', select: 'name email' }
    ]);

    res.status(201).json({
      message: 'Booking created successfully',
      booking: {
        _id: booking._id,
        bookingNumber: booking.bookingNumber,
        hotel: booking.hotelId,
        room: booking.roomId,
        user: booking.userId,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        numberOfNights: booking.numberOfNights,
        guests: booking.guests,
        guestDetails: booking.guestDetails,
        pricePerNight: booking.pricePerNight,
        totalPrice: booking.totalPrice,
        taxes: booking.taxes,
        fees: booking.fees,
        discount: booking.discount,
        finalPrice: booking.finalPrice,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        paymentMethod: booking.paymentMethod,
        specialRequests: booking.specialRequests,
        roomPreferences: booking.roomPreferences,
        cancellationPolicy: booking.cancellationPolicy,
        createdAt: booking.createdAt
      }
    });

  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};
