"use client"

import { createContext, useContext, useReducer } from "react"
import axios from "axios"
import { toast } from "react-toastify"

const BookingContext = createContext()

// ✅ Charger les réservations depuis localStorage au démarrage
const loadBookingsFromStorage = () => {
  try {
    const savedBookings = localStorage.getItem('userBookings')
    return savedBookings ? JSON.parse(savedBookings) : []
  } catch (e) {
    console.warn('Could not load bookings from localStorage:', e)
    return []
  }
}

const initialState = {
  bookings: loadBookingsFromStorage(), // ✅ Charger depuis localStorage
  currentBooking: null,
  loading: false,
  searchFilters: {
    location: "",
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    guests: 1,
    priceRange: [0, 1000],
    amenities: [],
    rating: 0
  },
}

const bookingReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    case "SET_BOOKINGS":
      return { ...state, bookings: action.payload }
    case "SET_CURRENT_BOOKING":
      return { ...state, currentBooking: action.payload }
    case "UPDATE_SEARCH_FILTERS":
      return {
        ...state,
        searchFilters: { ...state.searchFilters, ...action.payload },
      }
    case "ADD_BOOKING":
      return {
        ...state,
        bookings: [...state.bookings, action.payload],
      }
    case "UPDATE_BOOKING":
      return {
        ...state,
        bookings: state.bookings.map((booking) => (booking._id === action.payload._id ? action.payload : booking)),
      }
    default:
      return state
  }
}

export const BookingProvider = ({ children }) => {
  const persisted = (() => {
    try {
      const saved = localStorage.getItem('currentBooking')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })()

  const [state, dispatch] = useReducer(bookingReducer, {
    ...initialState,
    currentBooking: persisted
  })

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const fetchBookings = async () => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      const response = await axios.get("/api/bookings", { headers: getAuthHeaders() })
      dispatch({ type: "SET_BOOKINGS", payload: response.data.bookings })
    } catch (error) {
      toast.error("Failed to fetch bookings")
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const fetchUserBookings = async (userId) => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      console.log('Fetching bookings for user:', userId)
      console.log('Auth headers:', getAuthHeaders())
      
      const response = await axios.get(`/api/bookings/user/${userId}`, { headers: getAuthHeaders() })
      console.log('Bookings response:', response.data)
      console.log('Response status:', response.status)
      
      const bookings = response?.data?.bookings || response?.data?.results?.bookings || response?.data?.data?.bookings || []
      console.log('Parsed bookings:', bookings)
      console.log('Number of bookings found:', bookings.length)
      
      dispatch({ type: "SET_BOOKINGS", payload: bookings })
      
      // ✅ Sauvegarder les réservations localement pour persistance
      try {
        localStorage.setItem('userBookings', JSON.stringify(bookings))
      } catch (e) {
        console.warn('Could not save bookings to localStorage:', e)
      }
      
      return { success: true }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      console.error('Error response:', error.response)
      console.error('Error status:', error.response?.status)
      console.error('Error data:', error.response?.data)
      
      toast.error(error.response?.data?.message || "Failed to fetch bookings")
      // ✅ Ne pas vider les réservations en cas d'erreur - garder les existantes
      // dispatch({ type: "SET_BOOKINGS", payload: [] })
      return { success: false }
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const checkAvailability = async ({ hotelId, roomId, checkIn, checkOut, guests = 1, includeRoomDetails = false }) => {
    try {
      const response = await axios.post('/api/bookings/check-availability', {
        hotelId, roomId, checkIn, checkOut, guests, includeRoomDetails
      }, { headers: getAuthHeaders() })
      return { success: true, data: response.data }
    } catch (error) {
      const message = error.response?.data?.message || 'Availability check failed'
      return { success: false, message }
    }
  }

  const createBooking = async (bookingData) => {
    try {
      console.log('Creating booking with data:', bookingData)
      const response = await axios.post("http://localhost:5000/api/bookings", bookingData, { headers: getAuthHeaders() })
      console.log('Booking created successfully:', response.data)
      dispatch({ type: "ADD_BOOKING", payload: response.data.booking })
      toast.success("Booking created successfully!")
      return { success: true, booking: response.data.booking }
    } catch (error) {
      console.error('Booking creation error:', error.response?.data)
      console.error('Full error response:', error.response)
      console.error('Validation errors:', error.response?.data?.errors)
      
      // Afficher les détails des erreurs de validation
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        error.response.data.errors.forEach((err, index) => {
          console.error(`Validation error ${index + 1}:`, err)
        })
      }
      
      toast.error(error.response?.data?.message || "Booking failed")
      return { success: false, error: error.response?.data?.message }
    }
  }

  const cancelBooking = async (bookingId) => {
    try {
      console.log('Cancelling booking via context:', bookingId);
      
      // ✅ Utiliser la route utilisateur au lieu de la route admin
      const response = await axios.patch(`/api/bookings/${bookingId}/cancel`, 
        { 
          reason: 'Cancelled by user' 
        }, 
        { headers: getAuthHeaders() }
      );
      
      console.log('Booking cancelled successfully via context:', response.data);
      
      // ✅ Mettre à jour la réservation dans le contexte
      dispatch({ type: "UPDATE_BOOKING", payload: response.data.booking })
      
      // ✅ Sauvegarder les réservations mises à jour
      try {
        const currentBookings = state.bookings.map(b => 
          b._id === bookingId 
            ? { ...b, status: 'cancelled', paymentStatus: 'refunded' }
            : b
        );
        localStorage.setItem('userBookings', JSON.stringify(currentBookings));
      } catch (e) {
        console.warn('Could not save updated bookings to localStorage:', e);
      }
      
      toast.success("Booking cancelled successfully!")
      return { success: true }
    } catch (error) {
      console.error('Cancel booking error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || "Cancellation failed")
      return { success: false }
    }
  }

  const updateSearchFilters = (filters) => {
    dispatch({ type: "UPDATE_SEARCH_FILTERS", payload: filters })
  }

  const clearBookings = () => {
    dispatch({ type: "SET_BOOKINGS", payload: [] })
    try {
      localStorage.removeItem('userBookings')
    } catch (e) {
      console.warn('Could not clear bookings from localStorage:', e)
    }
  }

  const value = {
    ...state,
    fetchBookings,
    fetchUserBookings,
    checkAvailability,
    createBooking,
    cancelBooking,
    updateSearchFilters,
    clearBookings, // ✅ Fonction pour nettoyer les réservations
    setCurrentBooking: (booking) => {
      try {
        if (booking) {
          localStorage.setItem('currentBooking', JSON.stringify(booking))
        } else {
          localStorage.removeItem('currentBooking')
        }
      } catch {}
      dispatch({ type: "SET_CURRENT_BOOKING", payload: booking })
    },
  }

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
}

export const useBooking = () => {
  const context = useContext(BookingContext)
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider")
  }
  return context
}
