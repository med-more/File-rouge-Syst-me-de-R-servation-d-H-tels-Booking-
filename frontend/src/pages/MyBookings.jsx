import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { formatCurrencyMAD } from '../utils/helpers';
import axios from 'axios';
import { toast } from 'react-toastify';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]); // ✅ Safe default: empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/bookings');
        const safeData = Array.isArray(response?.data) ? response.data : [];
        setBookings(safeData); // ✅ Always set to array
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings. Please try again later.');
        toast.error('Failed to load bookings');
        setBookings([]); // ✅ Ensure fallback is array
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    try {
      await axios.delete(`/api/bookings/${bookingId}`);
      setBookings((prevBookings) =>
        prevBookings.filter((booking) => booking._id !== bookingId)
      );
      toast.success('Booking cancelled successfully');
    } catch (err) {
      toast.error('Failed to cancel booking');
    }
  };

  const hasBookings = bookings.length > 0; // ✅ Safe now because it's always an array

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 -mt-16 pt-16">
      <div className="container-custom py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>

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
              .filter((booking) => booking?.hotel)
              .map((booking) => (
                <div key={booking._id} className="bg-white rounded-2xl shadow-soft overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          {booking.hotel?.name || 'Unknown Hotel'}
                        </h2>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{booking.hotel?.location || 'No location available'}</span>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <Clock className="h-4 w-4 mr-1" />
                          {booking.status}
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
                        <p className="text-gray-900">${booking.totalAmount || '0.00'}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link
                        to={`/hotels/${booking.hotel?._id}`}
                        className="flex-1 sm:flex-none px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors text-center"
                      >
                        View Hotel Details
                      </Link>
                      {booking.status === 'confirmed' && (
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
