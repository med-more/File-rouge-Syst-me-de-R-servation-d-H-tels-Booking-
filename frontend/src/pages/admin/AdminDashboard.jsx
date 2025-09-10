"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Users,
  Building,
  CreditCard,
  TrendingUp,
  Calendar,
  MapPin,
  Banknote,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Mail,
} from "lucide-react"
import axios from "axios"
import { toast } from "react-toastify"
import { formatCurrencyMAD } from "../../utils/helpers"
import AdminLayout from "../../components/layout/AdminLayout"

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHotels: 0,
    totalBookings: 0,
    totalRevenue: 0,
    monthlyGrowth: {
      users: 0,
      hotels: 0,
      bookings: 0,
      revenue: 0,
    },
  })
  const [recentBookings, setRecentBookings] = useState([])
  const [recentUsers, setRecentUsers] = useState([])
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Récupérer les données du backend
        const token = localStorage.getItem('token')
        const response = await axios.get('http://localhost:5000/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        const data = response.data
        console.log('Dashboard data received:', data)
        
        // Utiliser la structure imbriquée du backend
        const overview = data.overview || {}
        const users = data.users || {}
        const hotels = data.hotels || {}
        const bookings = data.bookings || {}
        const recent = data.recent || {}
        
        // Calculer les pourcentages de croissance
        const userGrowth = users.newThisMonth > 0 && users.total > 0 ? 
          Math.round((users.newThisMonth / users.total) * 100) : 0
        const hotelGrowth = hotels.pending > 0 && hotels.total > 0 ? 
          Math.round((hotels.pending / hotels.total) * 100) : 0
        const bookingGrowth = bookings.confirmed > 0 && bookings.total > 0 ? 
          Math.round((bookings.confirmed / bookings.total) * 100) : 0
        const revenueGrowth = overview.monthlyRevenue > 0 && overview.totalRevenue > 0 ? 
          Math.round((overview.monthlyRevenue / overview.totalRevenue) * 100) : 0
        
        const dashboardData = {
          totalUsers: overview.totalUsers || 0,
          totalHotels: overview.totalHotels || 0,
          totalBookings: overview.totalBookings || 0,
          totalRevenue: overview.totalRevenue || 0,
          monthlyGrowth: {
            users: userGrowth,
            hotels: hotelGrowth,
            bookings: bookingGrowth,
            revenue: revenueGrowth
          }
        }
        
        console.log('Processed dashboard data:', dashboardData)
        console.log('Recent bookings:', recent.bookings)
        console.log('Recent users:', recent.users)
        setStats(dashboardData)
        setRecentBookings(recent.bookings || [])
        setRecentUsers(recent.users || [])
        
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error)
        toast.error("Erreur lors du chargement des données du tableau de bord")
        
        // Fallback aux données statiques en cas d'erreur
        const fallbackData = {
          totalUsers: 0,
          totalHotels: 0,
          totalBookings: 0,
          totalRevenue: 0,
          monthlyGrowth: {
            users: 0,
            hotels: 0,
            bookings: 0,
            revenue: 0
          }
        }
        setStats(fallbackData)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const formatNumber = (number) => {
    return number ? number.toLocaleString() : "0"
  }

  const statCards = [
    {
      title: "Total Users",
      value: formatNumber(stats?.totalUsers || 0),
      change: stats?.monthlyGrowth?.users || 0,
      icon: Users,
      color: "primary"
    },
    {
      title: "Total Hotels",
      value: formatNumber(stats?.totalHotels || 0),
      change: stats?.monthlyGrowth?.hotels || 0,
      icon: Building,
      color: "green"
    },
    {
      title: "Total Bookings",
      value: formatNumber(stats?.totalBookings || 0),
      change: stats?.monthlyGrowth?.bookings || 0,
      icon: Calendar,
      color: "blue"
    },
    {
      title: "Total Revenue",
      value: formatCurrencyMAD(stats?.totalRevenue || 0),
      change: stats?.monthlyGrowth?.revenue || 0,
      icon: Banknote,
      color: "purple"
    }
  ]

  const quickActions = [
    {
      title: "Add New Hotel",
      description: "Register a new hotel property",
      icon: Building,
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
      link: "/admin/hotels",
    },
    {
      title: "Manage Users",
      description: "View and manage user accounts",
      icon: Users,
      color: "bg-gradient-to-r from-green-500 to-green-600",
      link: "/admin/users",
    },
    {
      title: "Payment Overview",
      description: "Monitor payment transactions",
      icon: CreditCard,
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      link: "/admin/payments",
    },
    {
      title: "Analytics",
      description: "View detailed analytics and reports",
      icon: TrendingUp,
      color: "bg-gradient-to-r from-orange-500 to-orange-600",
      link: "/admin/analytics",
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-300 rounded-2xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-300 rounded-2xl"></div>
              <div className="h-96 bg-gray-300 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="min-h-screen pt-8 flex flex-col items-center justify-center relative overflow-hidden bg-gray-50">
      {/* Background Spots - Style premium */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="container-custom py-8 relative z-10 w-full">
        <div className="max-w-7xl mx-auto">
          {/* Header Card */}
          <div className="bg-white p-8 rounded-3xl shadow-2xl relative overflow-hidden mb-8 border border-blue-200/40 animate-fade-in-up">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
            <div className="relative z-10 text-center">
              <h1 className="text-3xl md:text-4xl font-extrabold text-black drop-shadow-lg mb-2">Admin Dashboard</h1>
              <p className="text-lg text-blue-700/80">Welcome back! Here's what's happening with your platform.</p>
            </div>
        </div>

        {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in-up">
          {statCards.map((card, index) => (
            <div
              key={card.title}
                className="bg-white/80 backdrop-blur rounded-2xl shadow-xl border-2 border-blue-200/30 hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden animate-fade-in-up"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: "fadeInUp 0.6s ease-out forwards",
              }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 bg-blue-100 rounded-lg`}>
                      <card.icon className={`h-6 w-6 text-blue-600`} />
                  </div>
                  <div className="flex items-center text-sm">
                    {card.change >= 0 ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={card.change >= 0 ? "text-green-600" : "text-red-600"}>
                      {Math.abs(card.change)}%
                    </span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{card.value}</div>
                <div className="text-sm text-gray-600">{card.title}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
          <div className="mb-8 animate-fade-in-up">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={action.title}
                to={action.link}
                  className="group bg-white/80 backdrop-blur rounded-2xl shadow-xl border-2 border-blue-200/30 hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden transform hover:-translate-y-1 animate-fade-in-up"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: "fadeInUp 0.6s ease-out forwards",
                }}
              >
                <div className="p-6">
                    <div className={`${action.color} rounded-xl p-4 mb-4 w-fit shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up">
          {/* Recent Bookings */}
            <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl border-2 border-blue-200/30">
              <div className="p-6 border-b border-blue-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Recent Bookings</h3>
                <Link
                  to="/admin/payments"
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentBookings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No recent bookings</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentBookings.slice(0, 5).map((booking) => (
                    <div
                      key={booking._id}
                        className="flex items-center justify-between p-4 bg-white/70 rounded-xl hover:bg-blue-50 transition-colors shadow"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{booking.hotelId?.name || 'Hotel'}</h4>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{booking.hotelId?.location || 'Location'}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{formatCurrencyMAD(booking.totalPrice || 0)}</div>
                        <div
                          className={`text-xs px-2 py-1 rounded-full ${
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-600"
                              : booking.status === "pending"
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-red-100 text-red-600"
                          }`}
                        >
                            {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Users */}
            <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl border-2 border-blue-200/30">
              <div className="p-6 border-b border-blue-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Recent Users</h3>
                <Link
                  to="/admin/users"
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No recent users</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentUsers.slice(0, 5).map((user) => (
                    <div
                        key={user._id}
                        className="flex items-center justify-between p-4 bg-white/70 rounded-xl hover:bg-blue-50 transition-colors shadow"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{user.name || user.firstName + ' ' + user.lastName}</h4>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <Mail className="h-4 w-4 mr-1" />
                            <span>{user.email}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                          <div className="font-semibold text-gray-900">{user.role || 'User'}</div>
                        <div
                          className={`text-xs px-2 py-1 rounded-full ${
                              user.isActive !== false
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                          }`}
                        >
                            {user.isActive !== false ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
