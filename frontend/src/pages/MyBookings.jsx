import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, RefreshCw } from 'lucide-react';
import { formatCurrencyMAD } from '../utils/helpers';
import { useAuth } from '../contexts/AuthContext';
import { useBooking } from '../contexts/BookingContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const MyBookings = () => {
  const { user } = useAuth();
  const { bookings, loading, fetchUserBookings, cancelBooking } = useBooking();
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  useEffect(() => {
    console.log('MyBookings useEffect triggered');
    console.log('User:', user);
    console.log('User ID:', user?._id);
    
    if (user?._id) {
      console.log('Fetching bookings for user:', user._id);
      fetchUserBookings(user._id);
    } else {
      console.log('No user ID, skipping fetch');
    }
  }, [user?._id, fetchUserBookings]);

  // Auto-refresh every 10 seconds to sync with admin changes
  useEffect(() => {
    if (!user?._id) return;
    
    const interval = setInterval(() => {
      fetchUserBookings(user._id);
    }, 10000);

    return () => clearInterval(interval);
  }, [user?._id, fetchUserBookings]);

  const handleRefresh = async () => {
    if (!user?._id) return;
    setRefreshing(true);
    try {
      await fetchUserBookings(user._id);
      setLastFetchTime(new Date());
      toast.success('Bookings refreshed');
    } catch (err) {
      toast.error('Failed to refresh bookings');
    } finally {
      setRefreshing(false);
    }
  };

  const handleDebug = async () => {
    try {
      console.log('=== DEBUG SESSION ===');
      console.log('Current user:', user);
      console.log('User ID:', user?._id);
      console.log('Current bookings:', bookings);
      console.log('Bookings length:', bookings?.length);
      
      // Test 1: Debug endpoint
      const debugResponse = await axios.get('/api/bookings/debug/all');
      console.log('Debug response:', debugResponse.data);
      
      // Test 2: Auth test
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'null');
      
      try {
        const authTestResponse = await axios.get('/api/auth/test-auth', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        console.log('Auth test response:', authTestResponse.data);
      } catch (authErr) {
        console.error('Auth test error:', authErr);
        console.error('Auth test status:', authErr.response?.status);
        console.error('Auth test data:', authErr.response?.data);
      }
      
      // Test 3: Direct API call
      if (user?._id) {
        try {
          const directResponse = await axios.get(`/api/bookings/user/${user._id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });
          console.log('Direct API response:', directResponse.data);
        } catch (directErr) {
          console.error('Direct API error:', directErr);
          console.error('Direct API status:', directErr.response?.status);
          console.error('Direct API data:', directErr.response?.data);
        }
      }
      
      toast.success(`Found ${debugResponse.data.totalBookings} total bookings in database`);
    } catch (err) {
      console.error('Debug error:', err);
      toast.error('Debug failed');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      console.log('Cancelling booking from MyBookings:', bookingId);
      
      // ✅ Utiliser la fonction du contexte
      const result = await cancelBooking(bookingId);
      
      if (result.success) {
        console.log('Booking cancelled successfully');
        // Refresh bookings after cancellation
        if (user?._id) {
          await fetchUserBookings(user._id);
        }
      }
    } catch (err) {
      console.error('Cancel booking error:', err);
      toast.error('Failed to cancel booking');
    }
  };

  // Fonction pour normaliser le statut d'affichage
  const normalizeStatus = (booking) => {
    // Priorité au paymentStatus pour l'affichage
    if (booking.paymentStatus === 'paid' || booking.status === 'confirmed' || booking.status === 'completed') {
      return 'Completed';
    }
    if (booking.paymentStatus === 'refunded' || booking.status === 'cancelled') {
      return 'Cancelled';
    }
    if (booking.paymentStatus === 'pending' || booking.status === 'pending') {
      return 'Pending';
    }
    return booking.status || 'Unknown';
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (booking) => {
    const status = normalizeStatus(booking);
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const hasBookings = bookings && bookings.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 -mt-16 pt-16">
      <div className="container-custom py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
            {lastFetchTime && (
              <p className="text-sm text-gray-500 mt-1">
                Last updated: {lastFetchTime.toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDebug}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Debug
            </button>
            <button
              onClick={() => {
                console.log('=== MANUAL TEST ===');
                console.log('User from context:', user);
                console.log('Bookings from context:', bookings);
                console.log('Loading state:', loading);
                if (user?._id) {
                  console.log('Calling fetchUserBookings directly...');
                  fetchUserBookings(user._id);
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Test
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : !hasBookings ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-soft p-12 max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600 mb-6">
                You haven't made any bookings yet. Start exploring our hotels to find your perfect stay.
              </p>
              <Link to="/hotels" className="btn-primary">
                Browse Hotels
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {bookings
              .filter((booking) => booking && booking._id) // ✅ Filtre plus permissif
              .map((booking) => (
                <div key={booking._id} className="bg-white rounded-2xl shadow-soft overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          {booking.hotel?.name || booking.hotelId?.name || 'Hotel Information Loading...'}
                        </h2>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{booking.hotel?.location || booking.hotelId?.location || 'Location information loading...'}</span>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking)}`}>
                          <Clock className="h-4 w-4 mr-1" />
                          {normalizeStatus(booking)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Check-in</h3>
                        <p className="text-gray-900">
                          {booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : '-'}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Check-out</h3>
                        <p className="text-gray-900">
                          {booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : '-'}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Total Amount</h3>
                        <p className="text-gray-900">{formatCurrencyMAD(booking.totalAmount || 0)}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link
                        to={`/hotels/${booking.hotel?._id || booking.hotelId?._id || booking.hotelId}`}
                        className="flex-1 sm:flex-none px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors text-center"
                      >
                        View Hotel Details
                      </Link>
                      {normalizeStatus(booking) === 'Pending' && (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          className="flex-1 sm:flex-none px-6 py-3 bg-red-100 text-red-600 rounded-xl font-semibold hover:bg-red-200 transition-colors"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
