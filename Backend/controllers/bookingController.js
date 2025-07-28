const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const Availability = require('../models/Availability');

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
