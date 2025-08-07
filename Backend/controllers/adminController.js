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
