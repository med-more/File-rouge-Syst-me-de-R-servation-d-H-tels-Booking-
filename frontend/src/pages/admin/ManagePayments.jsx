"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Filter,
  Eye,
  Download,
  CreditCard,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  RefreshCw,
  User,
  Building,
  MoreHorizontal,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import axios from "axios"
import { toast } from "react-toastify"
import AdminLayout from "../../components/layout/AdminLayout"
import { formatCurrencyMAD } from "../../utils/helpers"

const ManagePayments = () => {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterDateRange, setFilterDateRange] = useState("all")
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    successfulPayments: 0,
    failedPayments: 0,
    pendingPayments: 0,
    refundedPayments: 0,
  })

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const statusConfig = {
    completed: {
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-100",
      label: "Accepted",
    },
    pending: {
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
      label: "Pending",
    },
    failed: {
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-100",
      label: "Failed",
    },
    refunded: {
      icon: RefreshCw,
      color: "text-blue-600",
      bg: "bg-blue-100",
      label: "Refunded",
    },
  }

  const statuses = [
    { value: "all", label: "All Status" },
    { value: "completed", label: "Completed" },
    { value: "pending", label: "Pending" },
    { value: "failed", label: "Failed" },
    { value: "refunded", label: "Refunded" },
  ]

  const dateRanges = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "quarter", label: "This Quarter" },
  ]

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get('/api/admin/bookings?limit=200&sortBy=createdAt&sortOrder=desc', { headers: getAuthHeaders() })
      const bookings = Array.isArray(data?.bookings) ? data.bookings : []
      const mapped = bookings.map(b => {
        const normalizeStatus = () => {
          const ps = (b.paymentStatus || '').toLowerCase()
          const bs = (b.status || '').toLowerCase()
          // Priorité au paymentStatus pour l'affichage (cohérent avec MyBookings)
          if (ps === 'paid' || bs === 'confirmed' || bs === 'completed') return 'completed'
          if (ps === 'refunded' || bs === 'cancelled') return 'refunded'
          if (ps === 'failed') return 'failed'
          if (ps === 'pending' || bs === 'pending') return 'pending'
          return 'pending'
        }

        return {
          _id: b._id,
          bookingId: b.bookingNumber || b._id,
          userEmail: b.userId?.email,
          userName: b.userId?.name,
          hotelName: b.hotelId?.name,
          amount: Number(b.totalPrice ?? b.calculatedTotalPrice ?? b.finalPrice ?? 0),
          currency: 'MAD',
          status: normalizeStatus(),
          date: b.createdAt,
          paymentMethod: b.paymentMethod || 'credit_card',
          createdAt: b.createdAt,
        }
      })
      setPayments(mapped)
      computeStats(mapped)
    } catch (error) {
      console.error("Erreur lors du chargement des paiements:", error)
      toast.error("Erreur lors du chargement des paiements")
      setPayments([])
    } finally {
      setLoading(false)
    }
  }

  const computeStats = (rows) => {
    const totalRevenue = rows.filter(r => r.status === 'completed').reduce((sum, r) => sum + (r.amount || 0), 0)
    const totalTransactions = rows.length
    const successfulPayments = rows.filter(r => r.status === 'completed').length
    const failedPayments = rows.filter(r => r.status === 'failed').length
    const pendingPayments = rows.filter(r => r.status === 'pending').length
    const refundedPayments = rows.filter(r => r.status === 'refunded').length
    setStats({ totalRevenue, totalTransactions, successfulPayments, failedPayments, pendingPayments, refundedPayments })
  }

  const handleRefund = async (paymentId, amount) => {
    try {
      // Pas d'endpoint paiements dédié: on annule la réservation associée
      await axios.patch(`/api/admin/bookings/${paymentId}/status`, { status: 'cancelled', paymentStatus: 'refunded' }, { headers: getAuthHeaders() })
      toast.success("Refund processed (booking cancelled)")
      // Optimistic update - utiliser le même statut que le backend
      setPayments(prev => prev.map(p => p._id === paymentId ? { ...p, status: 'cancelled', paymentStatus: 'refunded' } : p))
      await fetchPayments()
      try { localStorage.setItem('bookingStatusUpdated', String(Date.now())) } catch {}
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to process refund'
      toast.error(msg)
    }
  }

  const handleConfirmPayment = async (paymentId) => {
    try {
      await axios.patch(`/api/admin/bookings/${paymentId}/status`, { status: 'confirmed', paymentStatus: 'paid' }, { headers: getAuthHeaders() })
      toast.success("Payment confirmed")
      // Optimistic update - utiliser le même statut que le backend
      setPayments(prev => prev.map(p => p._id === paymentId ? { ...p, status: 'confirmed', paymentStatus: 'paid' } : p))
      await fetchPayments()
      try { localStorage.setItem('bookingStatusUpdated', String(Date.now())) } catch {}
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to confirm payment'
      toast.error(msg)
    }
  }

  const exportPayments = async () => {
    try {
      const response = await axios.get("/api/admin/bookings", {
        headers: getAuthHeaders(),
        responseType: "blob",
      })

      const blob = response.data instanceof Blob ? response.data : new Blob([JSON.stringify(response.data)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", "payments-export.json")
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      toast.error("Failed to export payments")
    }
  }

  const filteredPayments = (payments || []).filter((payment) => {
    const matchesSearch =
      payment.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.hotelName?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "all" || payment.status === filterStatus

    // Add date range filtering logic here
    const matchesDateRange = filterDateRange === "all" // Simplified for now

    return matchesSearch && matchesStatus && matchesDateRange
  })

  const statCards = [
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      change: 12.5,
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Total Transactions",
      value: stats.totalTransactions.toLocaleString(),
      change: 8.2,
      icon: CreditCard,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Success Rate",
      value: `${((stats.successfulPayments / stats.totalTransactions) * 100 || 0).toFixed(1)}%`,
      change: 2.1,
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: "Pending Payments",
      value: stats.pendingPayments.toLocaleString(),
      change: -5.3,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
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
            <div className="h-16 bg-gray-300 rounded-2xl"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-gray-300 rounded-xl"></div>
              ))}
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
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-black drop-shadow-lg mb-2">Payment Management</h1>
                <p className="text-lg text-blue-700/80">Monitor and manage payment transactions</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            {/* <button
              onClick={exportPayments}
                  className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-xl font-semibold flex items-center gap-2 px-6 py-3 shadow hover:from-blue-200 hover:to-blue-300 transition-all duration-200 animate-fade-in-up"
            >
                  <Download className="h-5 w-5 mr-2" />
              Export
            </button> */}
            <button
              onClick={fetchPayments}
                  className="bg-gradient-to-r from-yellow-400 to-yellow-300 text-yellow-900 rounded-xl font-semibold flex items-center gap-2 px-6 py-3 shadow hover:from-yellow-300 hover:to-yellow-200 transition-all duration-200 animate-fade-in-up"
            >
                  <RefreshCw className="h-5 w-5 mr-2" />
              Refresh
            </button>
              </div>
          </div>
        </div>

        {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in-up">
          {statCards.map((stat, index) => (
            <div
              key={stat.title}
                className="bg-white/80 backdrop-blur rounded-2xl shadow-xl border-2 border-blue-200/30 hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden animate-fade-in-up"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: "fadeInUp 0.6s ease-out forwards",
              }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.bg} rounded-xl p-3`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="flex items-center text-sm">
                    {stat.change >= 0 ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={stat.change >= 0 ? "text-green-600" : "text-red-600"}>
                      {Math.abs(stat.change)}%
                    </span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.title}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl border-2 border-blue-200/30 p-6 mb-8 animate-fade-in-up">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            <select
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              {dateRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>

              <div className="flex items-center text-sm text-blue-700 font-semibold">
              <Filter className="h-4 w-4 mr-2" />
              {filteredPayments.length} of {payments.length} payments
            </div>
          </div>
        </div>

        {/* Payments Table */}
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl border-2 border-blue-200/30 overflow-hidden animate-fade-in-up">
          <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-100">
                <thead className="bg-blue-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Transaction</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Hotel</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
                <tbody className="bg-white divide-y divide-blue-50">
                {filteredPayments.map((payment, index) => {
                  const status = statusConfig[payment.status] || statusConfig.pending
                  const StatusIcon = status.icon

                  return (
                    <tr
                      key={payment._id}
                        className="hover:bg-blue-50 transition-colors animate-fade-in-up"
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animation: "fadeInUp 0.4s ease-out forwards",
                      }}
                    >
                      <td className="px-6 py-4">
                        <div>
                            <div className="text-sm font-bold text-gray-900">#{payment._id?.slice(-8) || "N/A"}</div>
                            <div className="text-xs text-gray-400">Booking: {payment.bookingId?.slice(-6) || "N/A"}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <User className="h-4 w-4 text-blue-700" />
                          </div>
                          <div>
                              <div className="text-sm font-bold text-gray-900">{payment.userName || "Unknown"}</div>
                              <div className="text-xs text-gray-400">{payment.userEmail || "No email"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                            <Building className="h-4 w-4 text-blue-200 mr-2" />
                            <div className="text-sm text-blue-700 font-semibold">{payment.hotelName || "Hotel Name"}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                          <div className="text-sm font-extrabold text-blue-700">
                          {formatCurrencyMAD(payment.amount || 0)}
                        </div>
                          <div className="text-xs text-gray-400">MAD</div>
                      </td>
                      <td className="px-6 py-4">
                        <div
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.color}`}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedPayment(payment)
                              setShowDetailsModal(true)
                            }}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {payment.status === "pending" && (
                            <button
                              onClick={() => handleConfirmPayment(payment._id)}
                              className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          {payment.status === "completed" && (
                            <button
                              onClick={() => handleRefund(payment._id, payment.amount)}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </button>
                          )}
                          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-12">
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CreditCard className="h-12 w-12 text-blue-200" />
              </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
            </div>
          )}
        </div>

        {/* Payment Details Modal */}
        {showDetailsModal && selectedPayment && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0 animate-fade-in"></div>
              <div className="relative z-10 w-full max-w-2xl">
                <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border-2 border-blue-200/60 p-8 animate-fade-in-up max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-extrabold text-blue-700">Payment Details</h3>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                      className="text-gray-400 hover:text-red-500 bg-white/70 rounded-full p-2 shadow border border-blue-100"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
              </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                      <h4 className="font-bold text-blue-700 mb-3">Transaction Info</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Transaction ID:</span>
                          <span className="ml-2 font-semibold">#{selectedPayment._id}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Booking ID:</span>
                          <span className="ml-2 font-semibold">{selectedPayment.bookingId}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Amount:</span>
                          <span className="ml-2 font-semibold">${selectedPayment.amount}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Currency:</span>
                          <span className="ml-2 font-semibold">{selectedPayment.currency}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                      <h4 className="font-bold text-blue-700 mb-3">Customer Info</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Name:</span>
                          <span className="ml-2 font-semibold">{selectedPayment.userName}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Email:</span>
                          <span className="ml-2 font-semibold">{selectedPayment.userEmail}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Hotel:</span>
                          <span className="ml-2 font-semibold">{selectedPayment.hotelName}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                    <h4 className="font-bold text-blue-700 mb-3">Payment Method</h4>
                    <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center">
                        <CreditCard className="h-8 w-8 text-blue-400 mr-3" />
                      <div>
                          <div className="font-semibold">**** **** **** {selectedPayment.last4 || "****"}</div>
                          <div className="text-sm text-blue-700">{selectedPayment.cardBrand || "Card"}</div>
                      </div>
                    </div>
                  </div>
                </div>

                  <div className="flex space-x-3 mt-8">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                      className="flex-1 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition-colors font-semibold"
                  >
                    Close
                  </button>
                  {selectedPayment.status === "completed" && (
                    <button
                      onClick={() => {
                        handleRefund(selectedPayment._id, selectedPayment.amount)
                        setShowDetailsModal(false)
                      }}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white rounded-xl transition-colors font-semibold"
                    >
                      Process Refund
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
      </div>
    </AdminLayout>
  )
}

export default ManagePayments
