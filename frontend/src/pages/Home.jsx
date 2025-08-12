"use client"

import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import {
  Search,
  Star,
  MapPin,
  Users,
  Calendar,
  CheckCircle,
  Shield,
  Award,
  Clock,
  ArrowRight,
  ChevronDown,
  Building2,
  Globe,
  Heart,
  Wifi,
  Car,
  Coffee,
  Compass,
  RotateCcw,
} from "lucide-react"
import axios from "axios"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { useAuth } from "../contexts/AuthContext"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { format } from "date-fns"
import { Fragment } from "react"

const Home = () => {
  const [searchData, setSearchData] = useState({
    location: "",
    checkIn: null,
    checkOut: null,
    adults: 1,
    children: 0,
    rooms: 1,
  })
  const [featuredHotels, setFeaturedHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated } = useAuth()
  const [citySuggestions, setCitySuggestions] = useState([])
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)
  const [showGuestDropdown, setShowGuestDropdown] = useState(false)

  const guestDropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (guestDropdownRef.current && !guestDropdownRef.current.contains(event.target)) {
        setShowGuestDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [guestDropdownRef])

  const cities = [
    "Paris",
    "New York",
    "London",
    "Tokyo",
    "Dubai",
    "Rome",
    "Marrakech",
    "Casablanca",
    "Tangier",
    "Madrid",
    "Berlin",
    "Amsterdam",
    "Sydney",
    "Rio de Janeiro",
    "Cairo",
  ]

  const SearchSchema = Yup.object().shape({
    location: Yup.string().required("Location is required"),
    checkIn: Yup.date().required("Check-in date is required").nullable(),
    checkOut: Yup.date()
      .required("Check-out date is required")
      .nullable()
      .min(Yup.ref("checkIn"), "Check-out date can't be before check-in date"),
    adults: Yup.number().min(1, "At least 1 adult is required").required("Number of adults is required"),
    children: Yup.number().min(0, "Number of children cannot be negative").required("Number of children is required"),
    rooms: Yup.number().min(1, "At least 1 room is required").required("Number of rooms is required"),
  })

  useEffect(() => {
    fetchFeaturedHotels()
  }, [])

  const fetchFeaturedHotels = async () => {
    try {
      const response = await axios.get("/api/hotels/featured")
      setFeaturedHotels(response.data && response.data.hotels ? response.data.hotels : [])
    } catch (error) {
      console.error("Error fetching featured hotels:", error)
      setFeaturedHotels([]) // Ensure featuredHotels is an array even on error
    } finally {
      setLoading(false)
    }
  }

  const handleLocationChange = (e) => {
    const value = e.target.value
    setSearchData({
      ...searchData,
      location: value,
    })
    if (value.length > 0) {
      setCitySuggestions(cities.filter((city) => city.toLowerCase().includes(value.toLowerCase())))
      setShowCitySuggestions(true)
    } else {
      setCitySuggestions([])
      setShowCitySuggestions(false)
    }
  }

  const handleSelectSuggestion = (suggestion) => {
    setSearchData({
      ...searchData,
      location: suggestion,
    })
    setCitySuggestions([])
    setShowCitySuggestions(false)
  }

  const stats = [
    { number: "2M+", label: "Happy Customers" },
    { number: "50K+", label: "Hotels Worldwide" },
    { number: "200+", label: "Countries" },
    { number: "4.8", label: "Average Rating" },
  ]

  const popularDestinations = [
    {
      name: "Paris",
      properties: "2,000+ properties",
      image: "https://placehold.co/400x300?text=Paris",
    },
    {
      name: "New York",
      properties: "1,500+ properties",
      image: "https://placehold.co/400x300?text=New+York",
    },
    {
      name: "London",
      properties: "1,800+ properties",
      image: "https://placehold.co/400x300?text=London",
    },
    {
      name: "Tokyo",
      properties: "1,200+ properties",
      image: "https://placehold.co/400x300?text=Tokyo",
    },
    {
      name: "Dubai",
      properties: "900+ properties",
      image: "https://placehold.co/400x300?text=Dubai",
    },
    {
      name: "Rome",
      properties: "1,100+ properties",
      image: "https://placehold.co/400x300?text=Rome",
    },
  ]

  const trendingDestinations = [
    {
      name: "Marrakech",
      description: "Vibrant city of culture and history",
      image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f11?w=800&auto=format&fit=crop&q=60",
    },
    {
      name: "Casablanca",
      description: "Modern metropolis by the Atlantic",
      image: "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=800&auto=format&fit=crop&q=60",
    },
    {
      name: "Tangier",
      description: "Gateway to Africa, rich in heritage",
      image: "https://images.unsplash.com/photo-1591456983933-0c264720bcd3?w=800&auto=format&fit=crop&q=60",
    },
    {
      name: "Paris",
      description: "The city of love and lights",
      image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&auto=format&fit=crop&q=60",
    },
    {
      name: "Madrid",
      description: "Dynamic capital with grand boulevards",
      image: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800&auto=format&fit=crop&q=60",
    },
  ]

  const propertyTypes = [
    {
      name: "Hotels",
      count: "400,000+",
      image: "https://placehold.co/400x300?text=Hotels",
    },
    {
      name: "Apartments",
      count: "800,000+",
      image: "https://placehold.co/400x300?text=Apartments",
    },
    {
      name: "Resorts",
      count: "50,000+",
      image: "https://placehold.co/400x300?text=Resorts",
    },
    {
      name: "Villas",
      count: "100,000+",
      image: "https://placehold.co/400x300?text=Villas",
    },
    {
      name: "Guest Houses",
      count: "150,000+",
      image: "https://placehold.co/400x300?text=Guest+Houses",
    },
  ]

  const features = [
    {
      icon: CheckCircle,
      title: "Best Price Guarantee",
      description: "Find a lower price? We'll match it and give you an extra 10% off",
      color: "from-green-500 to-emerald-600",
    },
    {
      icon: Shield,
      title: "Secure Booking",
      description: "Your data is protected with bank-level security encryption",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Award,
      title: "Quality Assured",
      description: "All hotels are verified and meet our high standards",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock customer service in multiple languages",
      color: "from-orange-500 to-red-500",
    },
  ]

  return (
    <Fragment>
      <div className="min-h-screen relative overflow-hidden">
        {/* Background Spots - Matching Login Page */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-gradient-to-r from-blue-500 to-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15"></div>
        </div>

        {/* Hero Section */}
        <section
          className="relative min-h-screen flex items-center justify-center overflow-hidden -mt-16 pt-32 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1506929562872-bb421503ef21?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80')",
          }}
        >
          {/* Background Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>

          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-soft"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-soft"></div>
          </div>

          <div className="relative z-10 container-custom text-center text-white pt-20 pb-40">
            <div className="max-w-3xl mx-auto space-y-4 animate-fade-in mb-12">
              <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight drop-shadow-lg">
                Find your next stay
              </h1>
              <p className="text-lg md:text-xl text-blue-100 leading-relaxed max-w-2xl mx-auto drop-shadow-md">
                Search deals on hotels, homes, and much more...
              </p>
            </div>

            {/* Search Form */}
            <div className="max-w-6xl mx-auto mt-8 relative z-20">
              <div className="bg-gradient-to-r from-yellow-100/40 via-white/40 to-yellow-100/40 rounded-2xl backdrop-blur-2xl shadow-2xl border border-yellow-200/30 p-4 md:p-6">
                <Formik
                  initialValues={searchData}
                  validationSchema={SearchSchema}
                  onSubmit={async (values) => {
                    const params = new URLSearchParams(values)
                    window.location.href = `/hotels?${params.toString()}`
                  }}
                >
                  {({ setFieldValue, values, errors, touched }) => (
                    <Form className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Location with Autocomplete */}
                        <div className="relative">
                          <div className="relative bg-white/90 rounded-lg border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all duration-200">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                              <Compass className="h-4 w-4 text-blue-500" />
                            </div>
                            <Field
                              name="location"
                              className="w-full pl-10 pr-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
                              placeholder="Where are you going?"
                              autoComplete="off"
                              onChange={(e) => {
                                handleLocationChange(e)
                                setFieldValue("location", e.target.value)
                              }}
                            />
                          </div>
                          {showCitySuggestions && citySuggestions.length > 0 && (
                            <ul className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto z-20">
                              {citySuggestions.map((city) => (
                                <li
                                  key={city}
                                  className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm text-gray-800"
                                  onClick={() => {
                                    handleSelectSuggestion(city)
                                    setFieldValue("location", city)
                                  }}
                                >
                                  {city}
                                </li>
                              ))}
                            </ul>
                          )}
                          <ErrorMessage name="location">
                            {(msg) => <div className="mt-1 text-xs text-red-600">{msg}</div>}
                          </ErrorMessage>
                        </div>

                        {/* Check-in Date */}
                        <div className="relative">
                          <div className="relative bg-white/90 rounded-lg border border-gray-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all duration-200">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                              <Calendar className="h-4 w-4 text-green-500" />
                            </div>
                            <DatePicker
                              selected={values.checkIn ? new Date(values.checkIn) : null}
                              onChange={(date) => setFieldValue("checkIn", date ? format(date, "yyyy-MM-dd") : "")}
                              minDate={new Date()}
                              dateFormat="dd/MM/yyyy"
                              className="w-full pl-10 pr-3 py-2 text-sm text-gray-700 focus:outline-none cursor-pointer"
                              placeholderText="Check-in"
                            />
                          </div>
                          <ErrorMessage name="checkIn">
                            {(msg) => <div className="mt-1 text-xs text-red-600">{msg}</div>}
                          </ErrorMessage>
                        </div>

                        {/* Check-out Date */}
                        <div className="relative">
                          <div className="relative bg-white/90 rounded-lg border border-gray-200 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-200 transition-all duration-200">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                              <Calendar className="h-4 w-4 text-red-500" />
                            </div>
                            <DatePicker
                              selected={values.checkOut ? new Date(values.checkOut) : null}
                              onChange={(date) => setFieldValue("checkOut", date ? format(date, "yyyy-MM-dd") : "")}
                              minDate={values.checkIn ? new Date(values.checkIn) : new Date()}
                              dateFormat="dd/MM/yyyy"
                              className="w-full pl-10 pr-3 py-2 text-sm text-gray-700 focus:outline-none cursor-pointer"
                              placeholderText="Check-out"
                            />
                          </div>
                          <ErrorMessage name="checkOut">
                            {(msg) => <div className="mt-1 text-xs text-red-600">{msg}</div>}
                          </ErrorMessage>
                        </div>

                        {/* Guests with Dropdown */}
                        <div className="relative" ref={guestDropdownRef}>
                          <div className="relative bg-white/90 rounded-lg border border-gray-200 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-200 transition-all duration-200">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                              <Users className="h-4 w-4 text-purple-500" />
                            </div>
                            <div
                              className="w-full pl-10 pr-3 py-2 text-sm text-gray-700 cursor-pointer flex justify-between items-center focus:outline-none"
                              onClick={() => setShowGuestDropdown(!showGuestDropdown)}
                            >
                              <span>
                                {values.adults} Adult{values.adults > 1 ? "s" : ""}, {values.children} Child
                                {values.children > 1 ? "ren" : ""}, {values.rooms} Room{values.rooms > 1 ? "s" : ""}
                              </span>
                              <ChevronDown
                                className={`h-4 w-4 text-gray-300 transition-transform duration-200 ${
                                  showGuestDropdown ? "rotate-180" : ""
                                }`}
                              />
                            </div>
                          </div>

                          {showGuestDropdown && (
                            <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3 z-20">
                              <div className="flex items-center justify-between py-1 border-b border-gray-100 last:border-b-0">
                                <span className="text-sm text-gray-700 font-medium">Adults</span>
                                <div className="flex items-center space-x-2">
                                  <button
                                    type="button"
                                    className="w-6 h-6 flex items-center justify-center rounded-md bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => setFieldValue("adults", Math.max(1, values.adults - 1))}
                                    disabled={values.adults <= 1}
                                  >
                                    -
                                  </button>
                                  <span className="w-6 text-center text-sm font-medium text-gray-800">
                                    {values.adults}
                                  </span>
                                  <button
                                    type="button"
                                    className="w-6 h-6 flex items-center justify-center rounded-md bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-colors duration-200"
                                    onClick={() => setFieldValue("adults", values.adults + 1)}
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              <div className="flex items-center justify-between py-1 border-b border-gray-100 last:border-b-0">
                                <span className="text-sm text-gray-700 font-medium">Children</span>
                                <div className="flex items-center space-x-2">
                                  <button
                                    type="button"
                                    className="w-6 h-6 flex items-center justify-center rounded-md bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => setFieldValue("children", Math.max(0, values.children - 1))}
                                    disabled={values.children <= 0}
                                  >
                                    -
                                  </button>
                                  <span className="w-6 text-center text-sm font-medium text-gray-800">
                                    {values.children}
                                  </span>
                                  <button
                                    type="button"
                                    className="w-6 h-6 flex items-center justify-center rounded-md bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-colors duration-200"
                                    onClick={() => setFieldValue("children", values.children + 1)}
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              <div className="flex items-center justify-between py-1 last:border-b-0">
                                <span className="text-sm text-gray-700 font-medium">Rooms</span>
                                <div className="flex items-center space-x-2">
                                  <button
                                    type="button"
                                    className="w-6 h-6 flex items-center justify-center rounded-md bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => setFieldValue("rooms", Math.max(1, values.rooms - 1))}
                                    disabled={values.rooms <= 1}
                                  >
                                    -
                                  </button>
                                  <span className="w-6 text-center text-sm font-medium text-gray-800">
                                    {values.rooms}
                                  </span>
                                  <button
                                    type="button"
                                    className="w-6 h-6 flex items-center justify-center rounded-md bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-colors duration-200"
                                    onClick={() => setFieldValue("rooms", values.rooms + 1)}
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                          <ErrorMessage name="adults">
                            {(msg) => <div className="mt-1 text-xs text-red-600">{msg}</div>}
                          </ErrorMessage>
                        </div>
                      </div>

                      {/* Search Button and Reset Button */}
                      <div className="flex justify-center space-x-4 mt-4">
                        <button
                          type="submit"
                          className="btn-accent px-8 py-4 text-lg font-bold flex items-center justify-center space-x-2"
                        >
                          <Search className="w-5 h-5" />
                          <span>Search</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFieldValue("location", "")
                            setFieldValue("checkIn", null)
                            setFieldValue("checkOut", null)
                            setFieldValue("adults", 1)
                            setFieldValue("children", 0)
                            setFieldValue("rooms", 1)
                          }}
                          className="btn-accent px-8 py-4 text-lg font-bold flex items-center justify-center space-x-2"
                        >
                          <RotateCcw className="w-5 h-5" />
                          <span>Reset Filters</span>
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce-gentle">
            <div className="w-6 h-10 border-2 border-white border-opacity-30 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white bg-opacity-60 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 relative z-10">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-8 rounded-2xl shadow-lg border border-yellow-200/50 transform hover:scale-105 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400/10 rounded-full"></div>
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl mx-auto mb-4 shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-4xl font-bold text-gray-800 mb-2">2M+</h3>
                <p className="text-gray-600 font-medium">Happy Customers</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl shadow-lg border border-blue-200/50 transform hover:scale-105 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-400/10 rounded-full"></div>
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mx-auto mb-4 shadow-lg">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-4xl font-bold text-gray-800 mb-2">50K+</h3>
                <p className="text-gray-600 font-medium">Hotels Worldwide</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl shadow-lg border border-green-200/50 transform hover:scale-105 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-green-400/10 rounded-full"></div>
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mx-auto mb-4 shadow-lg">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-4xl font-bold text-gray-800 mb-2">200+</h3>
                <p className="text-gray-600 font-medium">Countries</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl shadow-lg border border-purple-200/50 transform hover:scale-105 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-400/10 rounded-full"></div>
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mx-auto mb-4 shadow-lg">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-4xl font-bold text-gray-800 mb-2">4.8</h3>
                <p className="text-gray-600 font-medium">Average Rating</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Hotels Section */}
        <section className="section-padding relative z-10">
          <div className="container-custom">
            <h2 className="heading-lg text-center mb-12">Featured Hotels</h2>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
              </div>
            ) : (featuredHotels || []).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(featuredHotels || []).map((hotel) => (
                  <Link
                    key={hotel._id}
                    to={`/hotels/${hotel._id}`}
                    className="group relative bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.03] border-2 border-transparent hover:border-yellow-200 overflow-hidden"
                  >
                    {/* Gradient Border Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-yellow-500 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                    <div className="absolute inset-[2px] bg-white rounded-3xl z-0"></div>

                    <div className="relative z-10">
                      <div className="relative overflow-hidden rounded-t-3xl">
                        <img
                          src={hotel.images[0] || "/placeholder.svg"}
                          alt={hotel.name}
                          className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-700"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Heart Icon */}
                        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md rounded-full p-3 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                          <Heart className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors cursor-pointer" />
                        </div>

                        {/* Featured Badge */}
                        <div className="absolute bottom-4 left-4">
                          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center space-x-2">
                            <Star className="w-4 h-4 fill-current" />
                            <span>Featured</span>
                          </div>
                        </div>

                        {/* Rating Badge */}
                        <div className="absolute top-4 left-4">
                          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg flex items-center space-x-1">
                            <Star className="w-4 h-4 fill-current" />
                            <span>{hotel.rating}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 bg-gradient-to-b from-white via-gray-50/50 to-white">
                        <div className="mb-4">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight mb-2">
                            {hotel.name}
                          </h3>
                          <div className="flex items-center text-gray-600">
                            <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                            <span className="text-sm">{hotel.location}</span>
                          </div>
                        </div>

                        {/* Amenities */}
                        <div className="flex items-center justify-center space-x-2 mb-4">
                          <div className="flex items-center bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-2 rounded-full border border-blue-200">
                            <Wifi className="w-4 h-4 mr-1 text-blue-600" />
                            <span className="text-xs text-blue-700 font-medium">WiFi</span>
                          </div>
                          <div className="flex items-center bg-gradient-to-r from-green-50 to-green-100 px-3 py-2 rounded-full border border-green-200">
                            <Car className="w-4 h-4 mr-1 text-green-600" />
                            <span className="text-xs text-green-700 font-medium">Parking</span>
                          </div>
                          <div className="flex items-center bg-gradient-to-r from-yellow-50 to-yellow-100 px-3 py-2 rounded-full border border-yellow-200">
                            <Coffee className="w-4 h-4 mr-1 text-yellow-600" />
                            <span className="text-xs text-yellow-700 font-medium">Breakfast</span>
                          </div>
                        </div>

                        {/* Price and Reviews */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="text-center">
                            <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                              ${hotel.pricePerNight}
                            </p>
                            <p className="text-sm text-gray-500 font-medium">per night</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600 font-medium">
                              {(Math.random() * 500 + 100).toFixed(0)} reviews
                            </p>
                            <p className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded-full">
                              Free cancellation
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600 text-lg">No featured hotels found.</p>
            )}

            <div className="text-center mt-12">
              <Link to="/hotels" className="btn-accent inline-flex items-center px-8 py-4 text-lg font-bold">
                View All Hotels
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </section>

        {/* Popular Destinations Section */}
        <section className="section-padding relative z-10">
          <div className="container-custom">
            <h2 className="heading-lg text-center mb-12">Popular Destinations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {popularDestinations.map((destination, index) => (
                <Link
                  key={index}
                  to={`/hotels?location=${destination.name}`}
                  className="group relative bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.05] overflow-hidden"
                >
                  {/* Animated Border */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 via-green-500 to-yellow-500 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-x"></div>
                  <div className="absolute inset-[3px] bg-white rounded-3xl"></div>

                  <div className="relative z-10">
                    <div className="relative overflow-hidden rounded-t-3xl h-56">
                      <img
                        src={destination.image || "/placeholder.svg"}
                        alt={destination.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      />

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                      {/* Content Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <h3 className="text-2xl font-bold mb-2 group-hover:text-yellow-300 transition-colors transform group-hover:scale-105 duration-300">
                          {destination.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <p className="text-white/90 text-sm font-medium bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
                            {destination.properties}
                          </p>
                          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-3 py-1 rounded-full text-xs font-bold">
                            Popular
                          </div>
                        </div>
                      </div>

                      {/* Floating Elements */}
                      <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Trending Destinations Section */}
        <section className="section-padding relative z-10">
          <div className="container-custom">
            <h2 className="heading-lg text-center mb-12">Trending Destinations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
              {trendingDestinations.map((destination, index) => (
                <Link
                  key={index}
                  to={`/hotels?location=${destination.name}`}
                  className="group relative bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.08] overflow-hidden"
                >
                  {/* Pulsing Border Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
                  <div className="absolute inset-[2px] bg-white rounded-3xl"></div>

                  <div className="relative z-10">
                    <div className="relative overflow-hidden rounded-t-3xl h-48">
                      <img
                        src={destination.image || "/placeholder.svg"}
                        alt={destination.name}
                        className="w-full h-full object-cover transform group-hover:scale-125 transition-transform duration-700"
                      />

                      {/* Dynamic Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-red-900/70 via-transparent to-transparent group-hover:from-red-900/90 transition-all duration-300"></div>

                      {/* Trending Badge */}
                      <div className="absolute top-4 right-4 transform group-hover:scale-110 transition-transform duration-300">
                        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 rounded-full text-xs font-bold shadow-lg flex items-center space-x-1 animate-bounce">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          <span>Trending</span>
                        </div>
                      </div>

                      {/* Fire Icon */}
                      <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-orange-500 text-white p-2 rounded-full shadow-lg">
                          <div className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 bg-gradient-to-b from-white via-red-50/30 to-white">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                        {destination.name}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors">
                        {destination.description}
                      </p>

                      {/* Trending Indicator */}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <div
                            className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"
                            style={{ animationDelay: "0.4s" }}
                          ></div>
                        </div>
                        <span className="text-xs text-red-600 font-bold bg-red-50 px-2 py-1 rounded-full">Hot!</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Browse by Property Type Section */}
        <section className="section-padding relative z-10">
          <div className="container-custom">
            <h2 className="heading-lg text-center mb-12">Browse by Property Type</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
              {propertyTypes.map((type, index) => {
                // Use the project's existing color scheme
                const colors = [
                  "bg-blue-500", // Hotels - Blue
                  "bg-yellow-500", // Apartments - Yellow
                  "bg-green-500", // Resorts - Green
                  "bg-purple-500", // Villas - Purple
                  "bg-blue-600", // Guest Houses - Darker Blue
                ]
                const textColors = [
                  "text-blue-600", // Hotels
                  "text-yellow-600", // Apartments
                  "text-green-600", // Resorts
                  "text-purple-600", // Villas
                  "text-blue-700", // Guest Houses
                ]
                const bgColors = [
                  "bg-blue-50", // Hotels
                  "bg-yellow-50", // Apartments
                  "bg-green-50", // Resorts
                  "bg-purple-50", // Villas
                  "bg-blue-100", // Guest Houses
                ]
                const borderColors = [
                  "border-blue-200", // Hotels
                  "border-yellow-200", // Apartments
                  "border-green-200", // Resorts
                  "border-purple-200", // Villas
                  "border-blue-300", // Guest Houses
                ]

                return (
                  <Link
                    key={index}
                    to={`/hotels?type=${type.name}`}
                    className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl border border-gray-100 overflow-hidden"
                  >
                    <div className="relative overflow-hidden rounded-t-2xl h-48">
                      <img
                        src={type.image || "/placeholder.svg"}
                        alt={type.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    </div>

                    <div
                      className={`p-5 ${bgColors[index % bgColors.length]} border-t ${borderColors[index % borderColors.length]}`}
                    >
                      <div className="text-center">
                        <h3 className={`text-lg font-bold ${textColors[index % textColors.length]} mb-2`}>
                          {type.name}
                        </h3>
                        <div
                          className={`inline-block ${colors[index % colors.length]} text-white px-4 py-2 rounded-full text-sm font-bold`}
                        >
                          <span>{type.count}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="section-padding relative z-10">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="heading-lg mb-6">Why Choose HotelBook?</h2>
              <p className="text-lead max-w-2xl mx-auto">Experience the difference with our premium booking platform</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-100 p-8 text-center"
                >
                  <div
                    className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    <feature.icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {!isAuthenticated && (
          <section className="section-padding text-black relative overflow-hidden z-10">
            <div className="container-custom relative z-10 text-center">
              <div className="bg-gradient-to-r from-blue-50 to-yellow-50 rounded-3xl p-12 shadow-xl border border-blue-100/50">
                <h2 className="heading-lg text-black mb-6">Ready to Start Your Journey?</h2>
                <p className="text-xl text-black-100 mb-8 max-w-2xl mx-auto">
                  Join millions of travelers who trust HotelBook for their perfect stay
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/hotels" className="btn-accent px-8 py-4 text-lg font-bold">
                    Explore Hotels
                  </Link>
                  <Link to="/register" className="btn-accent px-8 py-4 text-lg font-bold">
                    Sign Up Free
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </Fragment>
  )
}

export default Home
