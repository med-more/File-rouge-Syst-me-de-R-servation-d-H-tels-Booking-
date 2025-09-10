"use client"

import { useState, useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import {
  Calendar,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Filter,
  Search,
  Eye,
  MoreHorizontal,
  X,
} from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { useBooking } from "../../contexts/BookingContext"
import { formatDate, formatCurrencyMAD } from "../../utils/helpers"
import axios from "axios"
import { toast } from "react-toastify"

const MyBookings = () => {
  const { user } = useAuth()
  const { bookings = [], fetchBookings, fetchUserBookings, cancelBooking } = useBooking()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [detailsBooking, setDetailsBooking] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState("")
  // Filtres avancés
  const [showFilters, setShowFilters] = useState(false)
  const [filterStatus, setFilterStatus] = useState("")
  const [filterDateFrom, setFilterDateFrom] = useState("")
  const [filterDateTo, setFilterDateTo] = useState("")
  const [filterPriceMin, setFilterPriceMin] = useState("")
  const [filterPriceMax, setFilterPriceMax] = useState("")

  // Données statiques de test
  const staticBookings = [
    {
      _id: "1",
      hotel: {
        name: "Hôtel Luxe Paris",
        location: "Paris, France"
      },
      checkIn: "2024-04-01",
      checkOut: "2024-04-05",
      totalPrice: 1000,
      status: "confirmed"
    },
    {
      _id: "2",
      hotel: {
        name: "Grand Hôtel Lyon",
        location: "Lyon, France"
      },
      checkIn: "2024-03-15",
      checkOut: "2024-03-18",
      totalPrice: 540,
      status: "cancelled"
    },
    {
      _id: "3",
      hotel: {
        name: "Hôtel Riviera Nice",
        location: "Nice, France"
      },
      checkIn: "2024-05-01",
      checkOut: "2024-05-07",
      totalPrice: 1920,
      status: "confirmed"
    }
  ]

  const derivedBookings = useMemo(() => {
    console.log('derivedBookings - bookings:', bookings, 'isArray:', Array.isArray(bookings))
    if (!Array.isArray(bookings)) {
      console.log('bookings is not an array, returning empty array')
      return []
    }
    console.log('Processing', bookings.length, 'bookings')
    return bookings.map((b) => {
      const statusNormalized = (() => {
        const ps = (b.paymentStatus || '').toLowerCase()
        const bs = (b.status || '').toLowerCase()
        if (ps === 'paid') return 'completed'
        if (bs === 'confirmed' || bs === 'completed') return 'completed'
        if (bs === 'cancelled') return 'cancelled'
        return 'pending'
      })()
      
      // Debug: afficher les détails de normalisation
      console.log('Booking normalization:', {
        id: b._id,
        originalStatus: b.status,
        originalPaymentStatus: b.paymentStatus,
        normalizedStatus: statusNormalized
      })
      
      return {
        _id: b._id,
        hotelName: b.hotel?.name || b.hotelName || 'Hotel',
        location: b.hotel?.location || b.hotelLocation || '',
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        totalPrice: b.totalPrice ?? b.finalPrice ?? b.total ?? 0,
        status: statusNormalized,
        // Garder les statuts originaux pour debug
        originalStatus: b.status,
        originalPaymentStatus: b.paymentStatus,
      }
    })
  }, [bookings])

  const tabs = [
    { id: "all", label: "All Bookings", count: derivedBookings.length },
    {
      id: "upcoming",
      label: "Upcoming",
      count: derivedBookings.filter((b) => new Date(b.checkIn) > new Date() && b.status !== "cancelled").length,
    },
    { id: "completed", label: "Completed", count: derivedBookings.filter((b) => b.status === "completed").length },
    { id: "cancelled", label: "Cancelled", count: derivedBookings.filter((b) => b.status === "cancelled").length },
  ]

  const statusConfig = {
    pending: {
      icon: AlertCircle,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
      label: "Pending Confirmation",
    },
    confirmed: {
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-100",
      label: "Confirmed",
    },
    completed: {
      icon: CheckCircle,
      color: "text-blue-600",
      bg: "bg-blue-100",
      label: "Completed",
    },
    cancelled: {
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-100",
      label: "Cancelled",
    },
  }

  useEffect(() => {
    console.log('MyBookings useEffect - user:', user)
    if (!user?._id) {
      console.log('No user ID, setting loading to false')
      setLoading(false)
      return
    }

    console.log('User has ID:', user._id, 'loading bookings...')
    loadBookings()

    // Rafraîchissement périodique (3s) pour refléter les actions admin
    const intervalId = setInterval(loadBookings, 3000)

    // Rafraîchir à la prise de focus / visibilité
    const onFocus = () => loadBookings()
    const onVisibility = () => { if (document.visibilityState === 'visible') loadBookings() }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibility)

    // Rafraîchissement instantané via broadcast localStorage
    const onStorage = (e) => {
      if (e.key === 'bookingStatusUpdated') {
        loadBookings()
      }
    }
    window.addEventListener('storage', onStorage)

    return () => {
      clearInterval(intervalId)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('storage', onStorage)
    }
  }, [user])

  const loadBookings = async () => {
    setLoading(true)
    console.log('Loading bookings for user:', user?._id)
    
    // Test direct de l'API
    try {
      const token = localStorage.getItem('token')
      console.log('Token exists:', !!token)
      const response = await axios.get(`http://localhost:5000/api/bookings/user/${user._id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      console.log('Direct API response:', response.data)
    } catch (error) {
      console.error('Direct API error:', error)
    }
    
    const result = await fetchUserBookings(user._id)
    console.log('Load bookings result:', result)
    setLoading(false)
  }

  const handleCancelBooking = async () => {
    if (!selectedBooking) return

    const result = await cancelBooking(selectedBooking._id)
    if (result.success) {
      setShowCancelModal(false)
      setSelectedBooking(null)
      loadBookings()
    }
  }

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const openDetails = async (booking) => {
    setDetailsError("")
    setDetailsLoading(true)
    setDetailsBooking(null)
    setShowDetailsModal(true)
    try {
      const { data } = await axios.get(`/api/bookings/${booking._id}`, { headers: getAuthHeaders() })
      // Normaliser les champs attendus
      const b = data?.booking || booking
      let hotelId = b.hotel?._id || b.hotelId?._id || b.hotelId || null
      let hotelImage = ''
      try {
        if (hotelId) {
          const hotelRes = await axios.get(`http://localhost:5000/api/hotels/${hotelId}`)
          hotelImage = hotelRes.data?.hotel?.images?.[0] || ''
        }
      } catch {}
      setDetailsBooking({
        _id: b._id,
        bookingNumber: b.bookingNumber || b._id?.slice(-6)?.toUpperCase(),
        hotelName: b.hotel?.name || b.hotelName,
        hotelLocation: b.hotel?.location || b.hotelLocation,
        hotelImage,
        roomType: b.room?.type || b.roomType,
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        numberOfNights: b.numberOfNights,
        guests: b.guests || { adults: 1, children: 0, infants: 0 },
        pricePerNight: b.pricePerNight,
        totalPrice: b.totalPrice ?? b.total,
        taxes: b.taxes || 0,
        fees: b.fees || 0,
        discount: b.discount || 0,
        finalPrice: b.finalPrice ?? b.totalPrice ?? b.total,
        paymentStatus: b.paymentStatus || 'pending',
        paymentMethod: b.paymentMethod || 'credit_card',
        status: b.status || 'confirmed',
        createdAt: b.createdAt,
      })
    } catch (error) {
      setDetailsError(error.response?.data?.message || 'Failed to load booking details')
    } finally {
      setDetailsLoading(false)
    }
  }

  const downloadReceipt = async (bookingId) => {
    try {
      const response = await axios.get(`/api/bookings/${bookingId}/receipt`, {
        responseType: "blob",
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `booking-receipt-${bookingId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      toast.error("Failed to download receipt")
    }
  }

  const filteredBookings = useMemo(() => {
    // Partir de la liste dérivée
    let bookingsList = [...derivedBookings]
    
    // Debug: afficher les réservations avant filtrage
    console.log('Before filtering:', {
      activeTab,
      totalBookings: bookingsList.length,
      bookings: bookingsList.map(b => ({ id: b._id, status: b.status, originalStatus: b.originalStatus, originalPaymentStatus: b.originalPaymentStatus }))
    })
    
    // Filtrage par tab
    switch (activeTab) {
      case "upcoming":
        bookingsList = bookingsList.filter(booking => new Date(booking.checkIn) > new Date() && booking.status !== "cancelled")
        break
      case "completed":
        bookingsList = bookingsList.filter(booking => booking.status === "completed")
        break
      case "cancelled":
        bookingsList = bookingsList.filter(booking => booking.status === "cancelled")
        break
      case "all":
      default:
        // Afficher toutes les réservations
        break
    }
    
    // Debug: afficher les réservations après filtrage
    console.log('After filtering:', {
      activeTab,
      filteredCount: bookingsList.length,
      filteredBookings: bookingsList.map(b => ({ id: b._id, status: b.status }))
    })
    // Filtrage avancé
    if (filterStatus) {
      bookingsList = bookingsList.filter(b => b.status === filterStatus)
    }
    if (filterDateFrom) {
      bookingsList = bookingsList.filter(b => new Date(b.checkIn) >= new Date(filterDateFrom))
    }
    if (filterDateTo) {
      bookingsList = bookingsList.filter(b => new Date(b.checkOut) <= new Date(filterDateTo))
    }
    if (filterPriceMin) {
      bookingsList = bookingsList.filter(b => b.totalPrice >= Number(filterPriceMin))
    }
    if (filterPriceMax) {
      bookingsList = bookingsList.filter(b => b.totalPrice <= Number(filterPriceMax))
    }
    // Recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      bookingsList = bookingsList.filter(b => (b.hotelName || '').toLowerCase().includes(term) || (b.location || '').toLowerCase().includes(term))
    }
    return bookingsList
  }, [derivedBookings, activeTab, filterStatus, filterDateFrom, filterDateTo, filterPriceMin, filterPriceMax, searchTerm])

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900">Veuillez vous connecter pour voir vos réservations</h2>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-32 flex flex-col items-center justify-center relative overflow-hidden bg-gray-50">
      {/* Background Spots - Style premium */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="container-custom py-8 relative z-10 w-full">
        <div className="max-w-5xl mx-auto">
          {/* Header Card */}
          <div className="bg-white p-8 rounded-3xl shadow-2xl relative overflow-hidden mb-8 border border-blue-200/40 animate-fade-in-up">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
            <div className="relative z-10 text-center">
              <h1 className="text-3xl md:text-4xl font-extrabold text-black drop-shadow-lg mb-2">My Bookings</h1>
              <p className="text-lg text-blue-700/80">Manage your hotel reservations and travel history</p>
            </div>
        </div>

        {/* Search and Filter */}
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl border border-blue-200/30 p-6 mb-8 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings by hotel name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
              <button
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-500 transition-all duration-200"
                onClick={() => setShowFilters(true)}
              >
              <Filter className="h-5 w-5 mr-2" />
                Advanced Filters
            </button>
          </div>
        </div>

          {/* Advanced Filters Modal (hors du flux principal pour z-index) */}
          {showFilters && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0 animate-fade-in"></div>
              <div className="relative z-10 w-full max-w-lg">
                <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border-2 border-blue-200/60 p-8 animate-fade-in-up">
                  <button className="absolute top-6 right-6 text-gray-400 hover:text-red-500 bg-white/70 rounded-full p-2 shadow border border-blue-100 transition-all duration-200" onClick={() => setShowFilters(false)}>
                    <X className="h-6 w-6" />
                  </button>
                  <h3 className="text-2xl font-extrabold text-blue-700 mb-8 text-center tracking-wide">Advanced Filters</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-blue-700 mb-1">Status</label>
                      <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="w-full border border-blue-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/90"
                      >
                        <option value="">All</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-blue-700 mb-1">Arrival (from)</label>
                      <input
                        type="date"
                        value={filterDateFrom}
                        onChange={e => setFilterDateFrom(e.target.value)}
                        className="w-full border border-blue-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/90"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-blue-700 mb-1">Departure (to)</label>
                      <input
                        type="date"
                        value={filterDateTo}
                        onChange={e => setFilterDateTo(e.target.value)}
                        className="w-full border border-blue-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/90"
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-blue-700 mb-1">Min Price</label>
                        <input
                          type="number"
                          min={0}
                          value={filterPriceMin}
                          onChange={e => setFilterPriceMin(e.target.value)}
                          className="w-full border border-blue-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/90"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-blue-700 mb-1">Max Price</label>
                        <input
                          type="number"
                          min={0}
                          value={filterPriceMax}
                          onChange={e => setFilterPriceMax(e.target.value)}
                          className="w-full border border-blue-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/90"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-8">
                    <button
                      className="px-6 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-semibold"
                      onClick={() => {
                        setFilterStatus("")
                        setFilterDateFrom("")
                        setFilterDateTo("")
                        setFilterPriceMin("")
                        setFilterPriceMax("")
                      }}
                    >
                      Reset
                    </button>
                    <button
                      className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-lg hover:from-blue-700 hover:to-blue-500 transition-all duration-200 font-semibold"
                      onClick={() => setShowFilters(false)}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Tabs */}
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl border border-blue-200/30 mb-8 animate-fade-in-up">
            <div className="border-b border-blue-100">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-semibold text-base transition-all duration-200 focus:outline-none ${
                    activeTab === tab.id
                        ? "border-blue-500 text-blue-700 bg-blue-50 scale-105"
                        : "border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-200"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                        activeTab === tab.id ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-soft p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Calendar className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune réservation trouvée
            </h3>
            <p className="text-gray-500">
              {activeTab === "all"
                ? "Vous n'avez pas encore de réservations"
                : activeTab === "upcoming"
                ? "Vous n'avez pas de réservations à venir"
                : activeTab === "past"
                ? "Vous n'avez pas de réservations passées"
                : "Vous n'avez pas de réservations annulées"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const status = statusConfig[booking.status] || statusConfig.pending
              const StatusIcon = status.icon
              const isUpcoming = new Date(booking.checkIn) > new Date()
              const canCancel = (["pending", "confirmed"].includes(booking.status)) && isUpcoming

              return (
                <div
                  key={booking._id}
                  className="bg-white rounded-2xl shadow-soft overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.hotelName}
                        </h3>
                        <p className="text-gray-600">{booking.location || "Location not specified"}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.color}`}
                      >
                        <StatusIcon className="h-4 w-4 mr-1" />
                        {status.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Date d'arrivée</p>
                        <p className="font-medium">
                          {new Date(booking.checkIn).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date de départ</p>
                        <p className="font-medium">
                          {new Date(booking.checkOut).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Prix total</p>
                        <p className="font-medium">{formatCurrencyMAD(booking.totalPrice || booking.total)}</p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => openDetails(booking)}
                        className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" /> Voir détails
                      </button>
                      {canCancel && (
                        <button
                          onClick={() => {
                            setSelectedBooking(booking)
                            setShowCancelModal(true)
                          }}
                          className="text-red-600 hover:text-red-700 font-medium"
                        >
                          Annuler la réservation
                        </button>
                      )}
                      </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Cancel Booking Modal */}
        {showCancelModal && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Booking</h3>
                <p className="text-gray-600">
                  Are you sure you want to cancel your booking at {selectedBooking.hotelName}?
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Check-in: {formatDate(selectedBooking.checkIn)}</div>
                  <div>Check-out: {formatDate(selectedBooking.checkOut)}</div>
                  <div>Total: {formatCurrencyMAD(selectedBooking.totalPrice || selectedBooking.total)}</div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleCancelBooking}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
                >
                  Cancel Booking
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Booking Details Modal */}
        {showDetailsModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 z-50">
            <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 max-w-md w-full overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-blue-50 to-white">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Détails de la réservation</h3>
                  {detailsBooking?.bookingNumber && (
                    <p className="text-sm text-gray-600">Référence: {detailsBooking.bookingNumber}</p>
                  )}
                </div>
                <button onClick={() => setShowDetailsModal(false)} className="text-gray-500 hover:text-red-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-4 max-h-[80vh] overflow-auto">
                {detailsLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                  </div>
                ) : detailsError ? (
                  <div className="text-red-600 text-sm">{detailsError}</div>
                ) : detailsBooking ? (
                  <div className="space-y-4">
                    {detailsBooking.hotelImage ? (
                      <div className="rounded-xl overflow-hidden border">
                        <img src={detailsBooking.hotelImage} alt={detailsBooking.hotelName} className="w-full h-40 object-cover" />
                      </div>
                    ) : null}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{detailsBooking.hotelName}</h4>
                      <div className="text-gray-600 flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> {detailsBooking.hotelLocation || '—'}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <p className="text-sm text-gray-500">Arrivée</p>
                        <p className="font-medium">{new Date(detailsBooking.checkIn).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Départ</p>
                        <p className="font-medium">{new Date(detailsBooking.checkOut).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Nuits</p>
                        <p className="font-medium">{detailsBooking.numberOfNights ?? '-'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {detailsBooking.guests?.adults || 1} ad.
                          {detailsBooking.guests?.children ? ` • ${detailsBooking.guests.children} enf.` : ''}
                          {detailsBooking.guests?.infants ? ` • ${detailsBooking.guests.infants} bébés` : ''}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700">Type de chambre: <span className="font-medium">{detailsBooking.roomType || '—'}</span></div>
                      <div className="text-sm text-gray-700">Statut paiement: <span className="font-medium capitalize">{detailsBooking.paymentStatus}</span></div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 border">
                      <h5 className="font-semibold text-gray-900 mb-2">Détails prix</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span>Prix par nuit</span><span>{formatCurrencyMAD(detailsBooking.pricePerNight || 0)}</span></div>
                        <div className="flex justify-between"><span>Taxes</span><span>{formatCurrencyMAD(detailsBooking.taxes || 0)}</span></div>
                        <div className="flex justify-between"><span>Frais</span><span>{formatCurrencyMAD(detailsBooking.fees || 0)}</span></div>
                        {detailsBooking.discount ? (
                          <div className="flex justify-between text-green-700"><span>Réduction</span><span>-{formatCurrencyMAD(detailsBooking.discount)}</span></div>
                        ) : null}
                        <div className="border-t pt-2 mt-2 flex justify-between font-semibold text-gray-900">
                          <span>Total</span><span>{formatCurrencyMAD(detailsBooking.finalPrice || detailsBooking.totalPrice || 0)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowDetailsModal(false)}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm"
                      >
                        Fermer
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}

export default MyBookings
