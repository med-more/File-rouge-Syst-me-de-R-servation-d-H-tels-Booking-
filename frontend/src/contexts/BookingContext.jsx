"use client"

import { createContext, useContext, useReducer } from "react"
import axios from "axios"
import { toast } from "react-toastify"

const BookingContext = createContext()

const initialState = {
  bookings: [],
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
  const [state, dispatch] = useReducer(bookingReducer, initialState)

  const fetchBookings = async () => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      const response = await axios.get("/api/bookings")
      dispatch({ type: "SET_BOOKINGS", payload: response.data.bookings })
    } catch (error) {
      toast.error("Failed to fetch bookings")
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const createBooking = async (bookingData) => {
    try {
      const response = await axios.post("/api/bookings", bookingData)
      dispatch({ type: "ADD_BOOKING", payload: response.data.booking })
      toast.success("Booking created successfully!")
      return { success: true, booking: response.data.booking }
    } catch (error) {
      toast.error(error.response?.data?.message || "Booking failed")
      return { success: false, error: error.response?.data?.message }
    }
  }

  const cancelBooking = async (bookingId) => {
    try {
      const response = await axios.put(`/api/bookings/${bookingId}/cancel`)
      dispatch({ type: "UPDATE_BOOKING", payload: response.data.booking })
      toast.success("Booking cancelled successfully!")
      return { success: true }
    } catch (error) {
      toast.error(error.response?.data?.message || "Cancellation failed")
      return { success: false }
    }
  }

  const updateSearchFilters = (filters) => {
    dispatch({ type: "UPDATE_SEARCH_FILTERS", payload: filters })
  }

  const value = {
    ...state,
    fetchBookings,
    createBooking,
    cancelBooking,
    updateSearchFilters,
    setCurrentBooking: (booking) => dispatch({ type: "SET_CURRENT_BOOKING", payload: booking }),
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
