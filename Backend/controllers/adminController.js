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
