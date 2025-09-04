const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const Booking = require('../models/Booking');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalHotels = await Hotel.countDocuments();
    const totalRooms = await Room.countDocuments();
    const totalBookings = await Booking.countDocuments();

    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });

    const activeUsers = await User.countDocuments({
      lastLoginAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    const activeHotels = await Hotel.countDocuments({ status: 'active' });
    const pendingHotels = await Hotel.countDocuments({ status: 'pending' });

    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

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

    const recentBookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('hotelId', 'name')
      .populate('roomId', 'type')
      .sort({ createdAt: -1 })
      .limit(10);

    const recentUsers = await User.find()
      .select('name email createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    const recentHotels = await Hotel.find()
      .select('name location status createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

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
    const { force = false } = req.query;
    
    // Vérifier s'il y a des réservations actives
    const activeBookings = await Booking.countDocuments({
      hotelId: id,
      status: { $in: ['confirmed', 'pending'] }
    });
    
    if (activeBookings > 0 && !force) {
      return res.status(400).json({
        message: `Cannot delete hotel with ${activeBookings} active bookings. Use ?force=true to force deletion.`,
        activeBookings,
        code: 'ACTIVE_BOOKINGS_EXIST'
      });
    }
    
    const hotel = await Hotel.findByIdAndDelete(id);
    
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    
    // Supprimer aussi toutes les chambres associées
    await Room.deleteMany({ hotelId: id });
    
    // Si suppression forcée, annuler toutes les réservations actives
    if (force && activeBookings > 0) {
      await Booking.updateMany(
        { hotelId: id, status: { $in: ['confirmed', 'pending'] } },
        { status: 'cancelled', cancellationReason: 'Hotel deleted by admin' }
      );
    }
    
    res.json({
      message: force ? `Hotel deleted successfully. ${activeBookings} active bookings were cancelled.` : 'Hotel deleted successfully'
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

// Gestion des utilisateurs
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, role, status } = req.query;
    
    let query = {};
    
    // Filtre par recherche
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filtre par rôle
    if (role && role !== 'all') {
      query.role = role;
    }
    
    // Filtre par statut
    if (status && status !== 'all') {
      if (status === 'active') {
        query.status = 'active';
      } else if (status === 'inactive') {
        query.status = 'inactive';
      } else if (status === 'verified') {
        query.isEmailVerified = true;
      } else if (status === 'unverified') {
        query.isEmailVerified = false;
      }
    }
    
    const skip = (page - 1) * limit;
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Vérifier s'il y a des réservations actives
    const activeBookings = await Booking.countDocuments({
      userId: user._id,
      status: { $in: ['confirmed', 'pending'] }
    });
    
    if (activeBookings > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete user with active bookings',
        code: 'ACTIVE_BOOKINGS_EXIST',
        activeBookings 
      });
    }
    
    await User.findByIdAndDelete(req.params.id);
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.bulkUserAction = async (req, res) => {
  try {
    const { userIds, action } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'User IDs are required' });
    }
    
    if (!['activate', 'deactivate', 'delete'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }
    
    let updateData = {};
    let deleteUsers = false;
    
    switch (action) {
      case 'activate':
        updateData = { status: 'active' };
        break;
      case 'deactivate':
        updateData = { status: 'inactive' };
        break;
      case 'delete':
        deleteUsers = true;
        break;
    }
    
    if (deleteUsers) {
      // Vérifier les réservations actives avant suppression
      const usersWithBookings = await Booking.aggregate([
        { $match: { userId: { $in: userIds }, status: { $in: ['confirmed', 'pending'] } } },
        { $group: { _id: '$userId', count: { $sum: 1 } } }
      ]);
      
      if (usersWithBookings.length > 0) {
        return res.status(400).json({ 
          message: 'Some users have active bookings and cannot be deleted',
          usersWithBookings 
        });
      }
      
      await User.deleteMany({ _id: { $in: userIds } });
    } else {
      await User.updateMany({ _id: { $in: userIds } }, updateData);
    }
    
    res.json({ 
      success: true, 
      message: `Bulk action '${action}' completed successfully` 
    });
  } catch (error) {
    console.error('Error performing bulk action:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.exportUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    // Créer le CSV
    const csvHeader = 'Name,Email,Role,Status,Email Verified,Created At\n';
    const csvRows = users.map(user => {
      return `${user.name || ''},${user.email},${user.role},${user.status || 'active'},${user.isEmailVerified ? 'Yes' : 'No'},${user.createdAt}`;
    }).join('\n');
    
    const csvContent = csvHeader + csvRows;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users-export.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
