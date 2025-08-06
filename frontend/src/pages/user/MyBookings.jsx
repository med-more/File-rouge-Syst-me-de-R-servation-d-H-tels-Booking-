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
import { formatDate, formatCurrency } from "../../utils/helpers"
import axios from "axios"
import { toast } from "react-toastify"

const MyBookings = () => {
  const { user } = useAuth()
  const { bookings = [], fetchBookings, cancelBooking } = useBooking()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
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

  const tabs = [
    { id: "all", label: "All Bookings", count: bookings.length },
    {
      id: "upcoming",
      label: "Upcoming",
      count: bookings.filter((b) => new Date(b.checkIn) > new Date() && b.status !== "cancelled").length,
    },
    { id: "completed", label: "Completed", count: bookings.filter((b) => b.status === "completed").length },
    { id: "cancelled", label: "Cancelled", count: bookings.filter((b) => b.status === "cancelled").length },
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
    loadBookings()
  }, [])

  const loadBookings = async () => {
    setLoading(true)
    await fetchBookings()
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
    // Utiliser les données statiques
    let bookingsList = [
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
    // Filtrage par tab
    switch (activeTab) {
      case "upcoming":
        bookingsList = bookingsList.filter(booking => new Date(booking.checkIn) > new Date())
        break
      case "past":
        bookingsList = bookingsList.filter(booking => new Date(booking.checkOut) < new Date())
        break
      case "cancelled":
        bookingsList = bookingsList.filter(booking => booking.status === "cancelled")
        break
      default:
        break
    }
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
    return bookingsList
  }, [activeTab, filterStatus, filterDateFrom, filterDateTo, filterPriceMin, filterPriceMax])

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
              const canCancel = booking.status === "confirmed" && isUpcoming

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
                        <p className="font-medium">{formatCurrency(booking.totalPrice || booking.total)}</p>
                      </div>
                    </div>

                    {booking.status === "confirmed" && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            setSelectedBooking(booking)
                            setShowCancelModal(true)
                          }}
                          className="text-red-600 hover:text-red-700 font-medium"
                        >
                          Annuler la réservation
                        </button>
                      </div>
                    )}
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
                  <div>Total: {formatCurrency(selectedBooking.totalPrice || selectedBooking.total)}</div>
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
        </div>
      </div>
    </div>
  )
}

export default MyBookings
