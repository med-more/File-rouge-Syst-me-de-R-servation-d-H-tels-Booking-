const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const Booking = require('../models/Booking');

exports.getDashboardStats = async (req, res) => {
  try {
    // Statistiques générales
    const totalUsers = await User.countDocuments();
    const totalHotels = await Hotel.countDocuments();
    const totalRooms = await Room.countDocuments();
    const totalBookings = await Booking.countDocuments();

    // Statistiques des utilisateurs
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });

    const activeUsers = await User.countDocuments({
      lastLoginAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    // Statistiques des hôtels
    const activeHotels = await Hotel.countDocuments({ status: 'active' });
    const pendingHotels = await Hotel.countDocuments({ status: 'pending' });

    // Statistiques des réservations
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

    // Revenus
    const totalRevenue = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    const monthlyRevenue = await Booking.aggregate([
      { 
        $match: { 
          status: 'confirmed',
          createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    // Réservations récentes
    const recentBookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('hotelId', 'name')
      .populate('roomId', 'type')
      .sort({ createdAt: -1 })
      .limit(10);

    // Utilisateurs récents
    const recentUsers = await User.find()
      .select('name email createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    // Hôtels récents
    const recentHotels = await Hotel.find()
      .select('name location status createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    // Statistiques par mois (12 derniers mois)
    const monthlyStats = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Top hôtels par réservations
    const topHotels = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      {
        $group: {
          _id: '$hotelId',
          bookingCount: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' }
        }
      },
      { $sort: { bookingCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'hotels',
          localField: '_id',
          foreignField: '_id',
          as: 'hotel'
        }
      },
      { $unwind: '$hotel' },
      {
        $project: {
          hotelName: '$hotel.name',
          bookingCount: 1,
          totalRevenue: 1
        }
      }
    ]);

    const dashboardStats = {
      overview: {
        totalUsers,
        totalHotels,
        totalRooms,
        totalBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthlyRevenue: monthlyRevenue[0]?.total || 0
      },
      users: {
        total: totalUsers,
        newThisMonth: newUsersThisMonth,
        active: activeUsers
      },
      hotels: {
        total: totalHotels,
        active: activeHotels,
        pending: pendingHotels
      },
      bookings: {
        total: totalBookings,
        confirmed: confirmedBookings,
        pending: pendingBookings,
        cancelled: cancelledBookings
      },
      recent: {
        bookings: recentBookings,
        users: recentUsers,
        hotels: recentHotels
      },
      analytics: {
        monthlyStats,
        topHotels
      }
    };

    res.json(dashboardStats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getHotels = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Construire le filtre
    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      filter.status = status;
    }

    // Construire le tri
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculer la pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Récupérer les hôtels avec pagination
    const hotels = await Hotel.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('rooms', 'type pricePerNight maxGuests quantity')
      .lean();

    // Compter le total pour la pagination
    const total = await Hotel.countDocuments(filter);
    
    // Calculer les statistiques pour chaque hôtel
    const hotelsWithStats = await Promise.all(
      hotels.map(async (hotel) => {
        // Compter les réservations pour cet hôtel
        const bookingStats = await Booking.aggregate([
          { $match: { hotelId: hotel._id } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              revenue: { $sum: '$totalPrice' }
            }
          }
        ]);

        // Calculer les revenus totaux
        const totalRevenue = bookingStats.reduce((sum, stat) => sum + stat.revenue, 0);
        
        // Compter les réservations par statut
        const confirmedBookings = bookingStats.find(stat => stat._id === 'confirmed')?.count || 0;
        const pendingBookings = bookingStats.find(stat => stat._id === 'pending')?.count || 0;
        const cancelledBookings = bookingStats.find(stat => stat._id === 'cancelled')?.count || 0;

        // Calculer le taux d'occupation (si des chambres existent)
        const totalRooms = hotel.rooms?.reduce((sum, room) => sum + room.quantity, 0) || 0;
        const occupancyRate = totalRooms > 0 ? (confirmedBookings / totalRooms) * 100 : 0;

        return {
          ...hotel,
          stats: {
            totalBookings: confirmedBookings + pendingBookings + cancelledBookings,
            confirmedBookings,
            pendingBookings,
            cancelledBookings,
            totalRevenue,
            occupancyRate: Math.round(occupancyRate * 100) / 100,
            totalRooms
          }
        };
      })
    );

    // Statistiques globales pour les filtres
    const globalStats = await Hotel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalHotels: { $sum: 1 },
          activeHotels: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          pendingHotels: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          inactiveHotels: {
            $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
          }
        }
      }
    ]);

    const response = {
      hotels: hotelsWithStats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrevPage: parseInt(page) > 1
      },
      filters: {
        search,
        status,
        sortBy,
        sortOrder
      },
      stats: globalStats[0] || {
        totalHotels: 0,
        activeHotels: 0,
        pendingHotels: 0,
        inactiveHotels: 0
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Get hotels error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createHotel = async (req, res) => {
  try {
    const hotelData = req.body;
    
    // Créer l'hôtel avec le statut par défaut
    const hotel = new Hotel({
      ...hotelData,
      status: hotelData.status || 'pending' // Par défaut en attente d'approbation
    });
    
    await hotel.save();
    
    res.status(201).json({
      message: 'Hotel created successfully',
      hotel
    });
  } catch (error) {
    console.error('Create hotel error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getHotelById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const hotel = await Hotel.findById(id)
      .populate('rooms', 'type pricePerNight maxGuests quantity')
      .lean();
    
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    
    // Calculer les statistiques pour cet hôtel
    const bookingStats = await Booking.aggregate([
      { $match: { hotelId: hotel._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      }
    ]);
    
    const totalRevenue = bookingStats.reduce((sum, stat) => sum + stat.revenue, 0);
    const confirmedBookings = bookingStats.find(stat => stat._id === 'confirmed')?.count || 0;
    const pendingBookings = bookingStats.find(stat => stat._id === 'pending')?.count || 0;
    const cancelledBookings = bookingStats.find(stat => stat._id === 'cancelled')?.count || 0;
    
    const totalRooms = hotel.rooms?.reduce((sum, room) => sum + room.quantity, 0) || 0;
    const occupancyRate = totalRooms > 0 ? (confirmedBookings / totalRooms) * 100 : 0;
    
    const hotelWithStats = {
      ...hotel,
      stats: {
        totalBookings: confirmedBookings + pendingBookings + cancelledBookings,
        confirmedBookings,
        pendingBookings,
        cancelledBookings,
        totalRevenue,
        occupancyRate: Math.round(occupancyRate * 100) / 100,
        totalRooms
      }
    };
    
    res.json(hotelWithStats);
  } catch (error) {
    console.error('Get hotel by id error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const hotel = await Hotel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    
    res.json({
      message: 'Hotel updated successfully',
      hotel
    });
  } catch (error) {
    console.error('Update hotel error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteHotel = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier s'il y a des réservations actives
    const activeBookings = await Booking.countDocuments({
      hotelId: id,
      status: { $in: ['confirmed', 'pending'] }
    });
    
    if (activeBookings > 0) {
      return res.status(400).json({
        message: `Cannot delete hotel with ${activeBookings} active bookings`
      });
    }
    
    const hotel = await Hotel.findByIdAndDelete(id);
    
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    
    // Supprimer aussi toutes les chambres associées
    await Room.deleteMany({ hotelId: id });
    
    res.json({
      message: 'Hotel deleted successfully'
    });
  } catch (error) {
    console.error('Delete hotel error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateHotelStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['active', 'pending', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const hotel = await Hotel.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    
    res.json({
      message: 'Hotel status updated successfully',
      hotel
    });
  } catch (error) {
    console.error('Update hotel status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ==================== GESTION DES RÉSERVATIONS ====================

exports.getBookings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      hotelId = '',
      userId = '',
      dateFrom = '',
      dateTo = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Construire le filtre
    const filter = {};
    
    if (search) {
      filter.$or = [
        { bookingNumber: { $regex: search, $options: 'i' } },
        { 'guestInfo.firstName': { $regex: search, $options: 'i' } },
        { 'guestInfo.lastName': { $regex: search, $options: 'i' } },
        { 'guestInfo.email': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (hotelId) {
      filter.hotelId = hotelId;
    }
    
    if (userId) {
      filter.userId = userId;
    }
    
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) {
        filter.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filter.createdAt.$lte = new Date(dateTo);
      }
    }

    // Construire le tri
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculer la pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Récupérer les réservations avec pagination
    const bookings = await Booking.find(filter)
      .populate('userId', 'name email')
      .populate('hotelId', 'name location')
      .populate('roomId', 'type pricePerNight')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Compter le total pour la pagination
    const total = await Booking.countDocuments(filter);
    
    // Calculer les statistiques pour chaque réservation
    const bookingsWithDetails = bookings.map(booking => {
      const nights = Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24));
      const totalPrice = booking.totalPrice || (booking.roomId?.pricePerNight * nights);
      
      return {
        ...booking,
        nights,
        calculatedTotalPrice: totalPrice,
        isOverdue: booking.status === 'confirmed' && new Date(booking.checkOut) < new Date(),
        isUpcoming: booking.status === 'confirmed' && new Date(booking.checkIn) > new Date()
      };
    });

    // Statistiques globales pour les filtres
    const globalStats = await Booking.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          confirmedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          pendingBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          totalRevenue: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, '$totalPrice', 0] }
          }
        }
      }
    ]);

    // Statistiques par statut
    const statusStats = await Booking.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      }
    ]);

    // Top hôtels par réservations
    const topHotels = await Booking.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$hotelId',
          bookingCount: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' }
        }
      },
      { $sort: { bookingCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'hotels',
          localField: '_id',
          foreignField: '_id',
          as: 'hotel'
        }
      },
      { $unwind: '$hotel' },
      {
        $project: {
          hotelName: '$hotel.name',
          bookingCount: 1,
          totalRevenue: 1
        }
      }
    ]);

    const response = {
      bookings: bookingsWithDetails,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrevPage: parseInt(page) > 1
      },
      filters: {
        search,
        status,
        hotelId,
        userId,
        dateFrom,
        dateTo,
        sortBy,
        sortOrder
      },
      stats: globalStats[0] || {
        totalBookings: 0,
        confirmedBookings: 0,
        pendingBookings: 0,
        cancelledBookings: 0,
        totalRevenue: 0
      },
      statusStats,
      topHotels
    };

    res.json(response);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findById(id)
      .populate('userId', 'name email phone')
      .populate('hotelId', 'name location description images')
      .populate('roomId', 'type description pricePerNight maxGuests')
      .lean();
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Calculer les détails supplémentaires
    const nights = Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24));
    const totalPrice = booking.totalPrice || (booking.roomId?.pricePerNight * nights);
    
    const bookingWithDetails = {
      ...booking,
      nights,
      calculatedTotalPrice: totalPrice,
      isOverdue: booking.status === 'confirmed' && new Date(booking.checkOut) < new Date(),
      isUpcoming: booking.status === 'confirmed' && new Date(booking.checkIn) > new Date(),
      canBeCancelled: booking.status === 'confirmed' && new Date(booking.checkIn) > new Date()
    };
    
    res.json(bookingWithDetails);
  } catch (error) {
    console.error('Get booking by id error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Vérifier si la réservation existe
    const existingBooking = await Booking.findById(id);
    if (!existingBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Si on change les dates, recalculer le prix total
    if (updateData.checkIn || updateData.checkOut) {
      const checkIn = updateData.checkIn || existingBooking.checkIn;
      const checkOut = updateData.checkOut || existingBooking.checkOut;
      const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
      
      // Récupérer le prix de la chambre
      const room = await Room.findById(existingBooking.roomId);
      if (room) {
        updateData.totalPrice = room.pricePerNight * nights;
      }
    }
    
    const booking = await Booking.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('userId', 'name email')
    .populate('hotelId', 'name location')
    .populate('roomId', 'type pricePerNight');
    
    res.json({
      message: 'Booking updated successfully',
      booking
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Vérifier si la réservation peut être supprimée
    if (booking.status === 'confirmed' && new Date(booking.checkIn) <= new Date()) {
      return res.status(400).json({
        message: 'Cannot delete confirmed booking that has already started'
      });
    }
    
    await Booking.findByIdAndDelete(id);
    
    res.json({
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Logique métier pour les changements de statut
    if (status === 'cancelled' && booking.status === 'confirmed') {
      // Vérifier si on peut annuler une réservation confirmée
      if (new Date(booking.checkIn) <= new Date()) {
        return res.status(400).json({
          message: 'Cannot cancel confirmed booking that has already started'
        });
      }
    }
    
    booking.status = status;
    
    // Si on confirme une réservation, mettre à jour la disponibilité
    if (status === 'confirmed' && booking.status !== 'confirmed') {
      // Logique pour mettre à jour la disponibilité des chambres
      // (à implémenter selon votre logique métier)
    }
    
    await booking.save();
    
    const updatedBooking = await Booking.findById(id)
      .populate('userId', 'name email')
      .populate('hotelId', 'name location')
      .populate('roomId', 'type pricePerNight');
    
    res.json({
      message: 'Booking status updated successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
