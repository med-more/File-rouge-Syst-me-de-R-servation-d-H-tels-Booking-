const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const Availability = require('../models/Availability');
const mongoose = require('mongoose');

exports.confirmBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { confirmationNotes } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot confirm a cancelled booking' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot confirm a completed booking' });
    }

    if (booking.status === 'confirmed') {
      return res.status(400).json({ message: 'Booking is already confirmed' });
    }

    const hotel = await Hotel.findById(booking.hotelId);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    const availabilityCheck = await Booking.checkAvailability(
      booking.hotelId,
      booking.roomId,
      booking.checkIn,
      booking.checkOut,
      booking.guests.adults
    );

    if (!availabilityCheck.available) {
      return res.status(400).json({ 
        message: 'Cannot confirm booking - insufficient availability',
        reason: availabilityCheck.reason
      });
    }

    const updateData = {
      status: 'confirmed',
      confirmedAt: new Date()
    };

    if (confirmationNotes) {
      updateData.confirmationNotes = confirmationNotes;
    }

    const confirmedBooking = await Booking.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (booking.status === 'pending') {
      try {
        await Availability.bookPeriod(
          booking.hotelId,
          booking.roomId,
          booking.checkIn,
          booking.checkOut,
          booking.guests.adults
        );
      } catch (error) {
        console.error('Error updating availability:', error);
      }
    }

    await confirmedBooking.populate([
      { path: 'hotelId', select: 'name location' },
      { path: 'roomId', select: 'type description' },
      { path: 'userId', select: 'name email' }
    ]);

    res.json({
      message: 'Booking confirmed successfully',
      booking: {
        _id: confirmedBooking._id,
        bookingNumber: confirmedBooking.bookingNumber,
        hotel: confirmedBooking.hotelId,
        room: confirmedBooking.roomId,
        user: confirmedBooking.userId,
        checkIn: confirmedBooking.checkIn,
        checkOut: confirmedBooking.checkOut,
        numberOfNights: confirmedBooking.numberOfNights,
        guests: confirmedBooking.guests,
        guestDetails: confirmedBooking.guestDetails,
        pricePerNight: confirmedBooking.pricePerNight,
        totalPrice: confirmedBooking.totalPrice,
        taxes: confirmedBooking.taxes,
        fees: confirmedBooking.fees,
        discount: confirmedBooking.discount,
        finalPrice: confirmedBooking.finalPrice,
        status: confirmedBooking.status,
        paymentStatus: confirmedBooking.paymentStatus,
        paymentMethod: confirmedBooking.paymentMethod,
        specialRequests: confirmedBooking.specialRequests,
        roomPreferences: confirmedBooking.roomPreferences,
        cancellationPolicy: confirmedBooking.cancellationPolicy,
        confirmationNotes: confirmedBooking.confirmationNotes,
        createdAt: confirmedBooking.createdAt,
        updatedAt: confirmedBooking.updatedAt,
        confirmedAt: confirmedBooking.confirmedAt
      },
      confirmation: {
        confirmedBy: req.user.userId,
        confirmedAt: confirmedBooking.confirmedAt,
        notes: confirmationNotes || null,
        availabilityUpdated: booking.status === 'pending'
      }
    });

  } catch (error) {
    console.error('Confirm booking error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

exports.getHotelBookings = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const {
      status,
      paymentStatus,
      checkIn,
      checkOut,
      roomId,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    const filter = { hotelId };

    if (status) {
      filter.status = status;
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    if (roomId) {
      filter.roomId = roomId;
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
      .populate('userId', 'name email phone')
      .populate('roomId', 'type description pricePerNight maxGuests')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filter);

    const totalBookings = await Booking.countDocuments({ hotelId });
    const confirmedBookings = await Booking.countDocuments({ hotelId, status: 'confirmed' });
    const cancelledBookings = await Booking.countDocuments({ hotelId, status: 'cancelled' });
    const completedBookings = await Booking.countDocuments({ hotelId, status: 'completed' });
    const pendingBookings = await Booking.countDocuments({ hotelId, status: 'pending' });
    const paidBookings = await Booking.countDocuments({ hotelId, paymentStatus: 'paid' });
    const pendingPayments = await Booking.countDocuments({ hotelId, paymentStatus: 'pending' });

    const revenueStats = await Booking.aggregate([
      { $match: { hotelId: new mongoose.Types.ObjectId(hotelId) } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$finalPrice' },
          averageBookingValue: { $avg: '$finalPrice' },
          totalNights: { $sum: '$numberOfNights' },
          averageNights: { $avg: '$numberOfNights' }
        }
      }
    ]);

    const revenueData = revenueStats[0] || {
      totalRevenue: 0,
      averageBookingValue: 0,
      totalNights: 0,
      averageNights: 0
    };

    const monthlyStats = await Booking.aggregate([
      { $match: { hotelId: new mongoose.Types.ObjectId(hotelId) } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$finalPrice' },
          averageValue: { $avg: '$finalPrice' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      hotel: {
        _id: hotel._id,
        name: hotel.name,
        location: hotel.location
      },
      bookings: bookings.map(booking => ({
        _id: booking._id,
        bookingNumber: booking.bookingNumber,
        user: booking.userId,
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
        cancellationReason: booking.cancellationReason,
        cancellationFee: booking.cancellationFee,
        source: booking.source,
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
        paidBookings,
        pendingPayments,
        confirmationRate: totalBookings > 0 ? Math.round((confirmedBookings / totalBookings) * 100) : 0,
        cancellationRate: totalBookings > 0 ? Math.round((cancelledBookings / totalBookings) * 100) : 0,
        completionRate: totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0,
        paymentRate: totalBookings > 0 ? Math.round((paidBookings / totalBookings) * 100) : 0
      },
      revenue: {
        totalRevenue: revenueData.totalRevenue,
        averageBookingValue: Math.round(revenueData.averageBookingValue * 100) / 100,
        totalNights: revenueData.totalNights,
        averageNights: Math.round(revenueData.averageNights * 100) / 100,
        monthlyStats: monthlyStats.map(stat => ({
          month: `${stat._id.year}-${String(stat._id.month).padStart(2, '0')}`,
          bookings: stat.count,
          revenue: stat.revenue,
          averageValue: Math.round(stat.averageValue * 100) / 100
        }))
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
        checkOut,
        roomId
      }
    });

  } catch (error) {
    console.error('Get hotel bookings error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const userObjectId = new mongoose.Types.ObjectId(req.user.userId);
    const bookingUserObjectId = new mongoose.Types.ObjectId(booking.userId);
    
    if (!userObjectId.equals(bookingUserObjectId)) {
      return res.status(403).json({ message: 'Access denied. You can only cancel your own bookings.' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel completed bookings' });
    }

    const canBeCancelled = booking.canBeCancelled();
    if (!canBeCancelled.canCancel) {
      return res.status(400).json({ 
        message: 'Cannot cancel this booking',
        reason: canBeCancelled.reason,
        deadline: canBeCancelled.deadline
      });
    }

    let cancellationFee = 0;
    const now = new Date();
    const checkInDate = new Date(booking.checkIn);
    const daysUntilCheckIn = Math.ceil((checkInDate - now) / (1000 * 60 * 60 * 24));

    switch (booking.cancellationPolicy) {
      case 'free_cancellation':
        cancellationFee = 0;
        break;
      case 'partial_refund':
        if (daysUntilCheckIn <= 24) {
          cancellationFee = booking.finalPrice * 0.5; // 50% de frais
        } else if (daysUntilCheckIn <= 48) {
          cancellationFee = booking.finalPrice * 0.25; // 25% de frais
        } else {
          cancellationFee = 0;
        }
        break;
      case 'no_refund':
        if (daysUntilCheckIn <= 72) {
          cancellationFee = booking.finalPrice; // Pas de remboursement
        } else {
          cancellationFee = booking.finalPrice * 0.1; // 10% de frais
        }
        break;
      default:
        cancellationFee = 0;
    }

    const updateData = {
      status: 'cancelled',
      cancelledAt: new Date(),
      cancellationReason: reason || 'Cancelled by user',
      cancellationFee: cancellationFee
    };

    const cancelledBooking = await Booking.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (booking.status === 'confirmed' || booking.status === 'pending') {
      try {
        await Availability.bookPeriod(
          booking.hotelId,
          booking.roomId,
          booking.checkIn,
          booking.checkOut,
          -booking.guests.adults // Libérer les chambres
        );
      } catch (error) {
        console.error('Error releasing availability:', error);
      }
    }

    await cancelledBooking.populate([
      { path: 'hotelId', select: 'name location' },
      { path: 'roomId', select: 'type description' },
      { path: 'userId', select: 'name email' }
    ]);

    res.json({
      message: 'Booking cancelled successfully',
      booking: {
        _id: cancelledBooking._id,
        bookingNumber: cancelledBooking.bookingNumber,
        hotel: cancelledBooking.hotelId,
        room: cancelledBooking.roomId,
        user: cancelledBooking.userId,
        checkIn: cancelledBooking.checkIn,
        checkOut: cancelledBooking.checkOut,
        numberOfNights: cancelledBooking.numberOfNights,
        guests: cancelledBooking.guests,
        guestDetails: cancelledBooking.guestDetails,
        pricePerNight: cancelledBooking.pricePerNight,
        totalPrice: cancelledBooking.totalPrice,
        taxes: cancelledBooking.taxes,
        fees: cancelledBooking.fees,
        discount: cancelledBooking.discount,
        finalPrice: cancelledBooking.finalPrice,
        status: cancelledBooking.status,
        paymentStatus: cancelledBooking.paymentStatus,
        paymentMethod: cancelledBooking.paymentMethod,
        specialRequests: cancelledBooking.specialRequests,
        roomPreferences: cancelledBooking.roomPreferences,
        cancellationPolicy: cancelledBooking.cancellationPolicy,
        cancellationReason: cancelledBooking.cancellationReason,
        cancellationFee: cancelledBooking.cancellationFee,
        cancelledAt: cancelledBooking.cancelledAt,
        createdAt: cancelledBooking.createdAt,
        updatedAt: cancelledBooking.updatedAt
      },
      cancellation: {
        fee: cancellationFee,
        refundAmount: booking.finalPrice - cancellationFee,
        policy: booking.cancellationPolicy,
        daysUntilCheckIn,
        reason: reason || 'Cancelled by user'
      }
    });

  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      checkIn,
      checkOut,
      guests,
      guestDetails,
      pricePerNight,
      taxes,
      fees,
      discount,
      paymentMethod,
      specialRequests,
      roomPreferences,
      cancellationPolicy
    } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const userObjectId = new mongoose.Types.ObjectId(req.user.userId);
    const bookingUserObjectId = new mongoose.Types.ObjectId(booking.userId);
    
    if (!userObjectId.equals(bookingUserObjectId)) {
      return res.status(403).json({ message: 'Access denied. You can only modify your own bookings.' });
    }

    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot modify cancelled or completed bookings' });
    }

    if (checkIn || checkOut) {
      const newCheckIn = checkIn ? new Date(checkIn) : booking.checkIn;
      const newCheckOut = checkOut ? new Date(checkOut) : booking.checkOut;
      const currentGuests = guests ? guests.adults : booking.guests.adults;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (newCheckIn < today) {
        return res.status(400).json({ message: 'Check-in date cannot be in the past' });
      }

      if (newCheckOut <= newCheckIn) {
        return res.status(400).json({ message: 'Check-out date must be after check-in date' });
      }

      const availabilityCheck = await Booking.checkAvailability(
        booking.hotelId,
        booking.roomId,
        newCheckIn,
        newCheckOut,
        currentGuests
      );

      if (!availabilityCheck.available) {
        return res.status(400).json({ 
          message: availabilityCheck.reason 
        });
      }
    }

    if (guests) {
      const room = await Room.findById(booking.roomId);
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }

      const totalGuests = guests.adults + guests.children + guests.infants;
      if (totalGuests > room.maxGuests) {
        return res.status(400).json({ 
          message: `Maximum ${room.maxGuests} guests allowed for this room type` 
        });
      }
    }

    const updateData = {};
    
    if (checkIn) updateData.checkIn = new Date(checkIn);
    if (checkOut) updateData.checkOut = new Date(checkOut);
    if (guests) updateData.guests = guests;
    if (guestDetails) updateData.guestDetails = guestDetails;
    if (pricePerNight) updateData.pricePerNight = pricePerNight;
    if (taxes !== undefined) updateData.taxes = taxes;
    if (fees !== undefined) updateData.fees = fees;
    if (discount !== undefined) updateData.discount = discount;
    if (paymentMethod) updateData.paymentMethod = paymentMethod;
    if (specialRequests !== undefined) updateData.specialRequests = specialRequests;
    if (roomPreferences) updateData.roomPreferences = roomPreferences;
    if (cancellationPolicy) updateData.cancellationPolicy = cancellationPolicy;

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    await updatedBooking.populate([
      { path: 'hotelId', select: 'name location' },
      { path: 'roomId', select: 'type description' },
      { path: 'userId', select: 'name email' }
    ]);

    res.json({
      message: 'Booking updated successfully',
      booking: {
        _id: updatedBooking._id,
        bookingNumber: updatedBooking.bookingNumber,
        hotel: updatedBooking.hotelId,
        room: updatedBooking.roomId,
        user: updatedBooking.userId,
        checkIn: updatedBooking.checkIn,
        checkOut: updatedBooking.checkOut,
        numberOfNights: updatedBooking.numberOfNights,
        guests: updatedBooking.guests,
        guestDetails: updatedBooking.guestDetails,
        pricePerNight: updatedBooking.pricePerNight,
        totalPrice: updatedBooking.totalPrice,
        taxes: updatedBooking.taxes,
        fees: updatedBooking.fees,
        discount: updatedBooking.discount,
        finalPrice: updatedBooking.finalPrice,
        status: updatedBooking.status,
        paymentStatus: updatedBooking.paymentStatus,
        paymentMethod: updatedBooking.paymentMethod,
        specialRequests: updatedBooking.specialRequests,
        roomPreferences: updatedBooking.roomPreferences,
        cancellationPolicy: updatedBooking.cancellationPolicy,
        createdAt: updatedBooking.createdAt,
        updatedAt: updatedBooking.updatedAt
      }
    });

  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

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
