"use client"

import { useState, useEffect, useRef } from "react"
import { formatCurrencyMAD } from "../utils/helpers"
import { Link } from "react-router-dom"
import {
  Search,
  MapPin,
  Star,
  Wifi,
  Car,
  Coffee,
  Waves,
  Users,
  Calendar,
  ChevronDown,
  SlidersHorizontal,
  ArrowRight,
} from "lucide-react"
import { useBooking } from "../contexts/BookingContext"
import axios from "axios"
import { toast } from "react-toastify"

const Hotels = () => {
  const { searchFilters, updateSearchFilters } = useBooking()
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState("recommended")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalHotels, setTotalHotels] = useState(0)
  const [citySuggestions, setCitySuggestions] = useState([])
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [allHotels, setAllHotels] = useState([]) // Store all hotels for client-side pagination
  const [filteredHotels, setFilteredHotels] = useState([]) // Store filtered hotels
  const searchRef = useRef(null)

  const cities = [
    "Paris", "New York", "London", "Tokyo", "Dubai", "Rome", "Marrakech", "Casablanca", 
    "Tangier", "Madrid", "Berlin", "Amsterdam", "Sydney", "Rio de Janeiro", "Cairo",
    "Rabat", "Fès", "Agadir", "Meknès", "Oujda", "Tétouan", "Safi", "Barcelone", 
    "Vienne", "Prague", "Istanbul", "Le Caire", "Bangkok", "Singapour", "Hong Kong", "Mumbai"
  ]

  const amenityIcons = {
    wifi: Wifi,
    parking: Car,
    restaurant: Coffee,
    pool: Waves,
  }

  const sortOptions = [
    { value: "recommended", label: "Recommended" },
    { value: "price_low", label: "Price: Low to High" },
    { value: "price_high", label: "Price: High to Low" },
    { value: "rating", label: "Guest Rating" },
    { value: "distance", label: "Distance from Center" },
  ]

  // Synchroniser searchQuery avec searchFilters.location
  useEffect(() => {
    setSearchQuery(searchFilters.location || "")
  }, [searchFilters.location])

  useEffect(() => {
    setCurrentPage(1) // Reset to first page when filters change
    fetchHotels(1)
  }, [searchFilters, sortBy])

  // Recharger les hôtels quand les filtres changent avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1) // Reset to first page when filters change
      fetchHotels(1)
    }, 500) // Délai de 500ms pour éviter trop d'appels API

    return () => clearTimeout(timeoutId)
  }, [searchFilters.location, searchFilters.priceRange, searchFilters.amenities, searchFilters.rating])

  const fetchHotels = async (page = 1) => {
    if (searching) return // Éviter les appels multiples
    
    setSearching(true)
    try {
      // Construire les paramètres de recherche
      const params = {}
      
      if (searchFilters.location) {
        params.location = searchFilters.location
      }
      
      if (searchFilters.priceRange) {
        params.minPrice = searchFilters.priceRange[0]
        params.maxPrice = searchFilters.priceRange[1]
      }
      
      if (searchFilters.amenities?.length > 0) {
        params.amenities = searchFilters.amenities.join(',')
      }
      
      if (searchFilters.rating) {
        params.rating = searchFilters.rating
      }
      
      // Appel API au backend
      const { data } = await axios.get('http://localhost:5000/api/hotels', { params })
      
      if (data.hotels) {
        let filteredHotels = [...data.hotels]
        
        // Trier les hôtels côté client
        switch (sortBy) {
          case "price_low":
            filteredHotels.sort((a, b) => a.pricePerNight - b.pricePerNight)
            break
          case "price_high":
            filteredHotels.sort((a, b) => b.pricePerNight - a.pricePerNight)
            break
          case "rating":
            filteredHotels.sort((a, b) => b.rating - a.rating)
            break
          case "distance":
            filteredHotels.sort((a, b) => (a.distance || 0) - (b.distance || 0))
            break
          default:
            // "recommended" - tri par défaut
            break
        }
        
        // Add default amenities to hotels that don't have any
        const hotelsWithAmenities = filteredHotels.map(hotel => {
          const defaultAmenities = ['wifi', 'parking', 'restaurant', 'pool']
          const randomAmenities = defaultAmenities.filter(() => Math.random() > 0.3) // Random selection
          
          return {
            ...hotel,
            amenities: hotel.amenities && hotel.amenities.length > 0 ? hotel.amenities : randomAmenities
          }
        })
        
        // Store all hotels and apply client-side filters
        setAllHotels(hotelsWithAmenities)
        const clientFiltered = applyFilters(hotelsWithAmenities)
        setFilteredHotels(clientFiltered)
      } else {
        setAllHotels([])
      }
    } catch (error) {
      console.error("Erreur lors du chargement des hôtels:", error)
      toast.error(error.response?.data?.message || "Erreur lors du chargement des hôtels")
      setAllHotels([])
    } finally {
      setSearching(false)
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    updateSearchFilters({ [key]: value })
  }

  const handlePriceRangeChange = (min, max) => {
    updateSearchFilters({ priceRange: [min, max] })
  }

  const applyFilters = (hotels) => {
    let filtered = [...hotels]

    // Filter by location
    if (searchFilters.location) {
      filtered = filtered.filter(hotel => 
        hotel.location.toLowerCase().includes(searchFilters.location.toLowerCase()) ||
        hotel.name.toLowerCase().includes(searchFilters.location.toLowerCase())
      )
    }

    // Filter by price range
    if (searchFilters.priceRange) {
      filtered = filtered.filter(hotel => 
        hotel.pricePerNight >= searchFilters.priceRange[0] && 
        hotel.pricePerNight <= searchFilters.priceRange[1]
      )
    }

    // Filter by amenities
    if (searchFilters.amenities && searchFilters.amenities.length > 0) {
      filtered = filtered.filter(hotel => {
        // Ensure amenities is an array
        const hotelAmenities = Array.isArray(hotel.amenities) ? hotel.amenities : []
        
        if (hotelAmenities.length === 0) {
          return false
        }
        
        // Check if hotel has ANY of the selected amenities (more permissive)
        const hasAnyAmenity = searchFilters.amenities.some(amenity => 
          hotelAmenities.includes(amenity)
        )
        
        return hasAnyAmenity
      })
    }

    // Filter by rating
    if (searchFilters.rating && searchFilters.rating > 0) {
      filtered = filtered.filter(hotel => 
        hotel.rating >= searchFilters.rating
      )
    }

    return filtered
  }

  const handleRatingChange = (rating) => {
    updateSearchFilters({ rating })
  }

  const handleLocationChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)
    
    if (value.length > 0) {
      setCitySuggestions(cities.filter((city) => 
        city.toLowerCase().includes(value.toLowerCase())
      ))
      setShowCitySuggestions(true)
    } else {
      setCitySuggestions([])
      setShowCitySuggestions(false)
    }
  }

  const handleSelectSuggestion = (suggestion) => {
    setSearchQuery(suggestion)
    updateSearchFilters({ location: suggestion })
    setCitySuggestions([])
    setShowCitySuggestions(false)
    setCurrentPage(1) // Reset to first page when selecting a suggestion
  }

  const updatePagination = () => {
    const itemsPerPage = 12
    const totalItems = filteredHotels.length
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedHotels = filteredHotels.slice(startIndex, endIndex)
    
    setHotels(paginatedHotels)
    setTotalPages(totalPages)
    setTotalHotels(totalItems)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Apply filters when searchFilters change
  useEffect(() => {
    if (allHotels.length > 0) {
      const filtered = applyFilters(allHotels)
      setFilteredHotels(filtered)
      setCurrentPage(1) // Reset to first page when filters change
    }
  }, [searchFilters, allHotels])

  // Update pagination when filteredHotels or currentPage changes
  useEffect(() => {
    updatePagination()
  }, [filteredHotels, currentPage])

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowCitySuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden -mt-16 pt-32">
      {/* Background Spots - Style Login */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-gradient-to-r from-blue-500 to-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15"></div>
      </div>
      <div className="container-custom py-8 relative z-10">
        {/* Enhanced Search Header */}
        <div className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl border border-blue-200/40 p-0 md:p-0 glassmorphism-form transition-all duration-500 animate-fade-in-up relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-black drop-shadow-lg animate-fade-in">
                Find Your Perfect Stay
              </h1>
              <p className="text-lg text-blue-700/80 max-w-2xl mx-auto animate-fade-in delay-100">
                Découvrez les meilleurs hôtels au meilleur prix partout dans le monde
              </p>
            </div>

            {/* Amazing Advanced Search Bar */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-blue-200/40 shadow-xl animate-fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative group" ref={searchRef}>
                  <label className="block text-sm font-bold text-blue-700 mb-2 tracking-wide">Destination</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-yellow-400 group-hover:scale-110 transition-transform duration-200" />
                    <input
                      type="text"
                      placeholder="Ville, hôtel..."
                      value={searchQuery}
                      onChange={handleLocationChange}
                      className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-xl text-blue-900 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200 bg-white/90 shadow-sm hover:shadow-lg animate-glow"
                    />
                    {showCitySuggestions && citySuggestions.length > 0 && (
                      <ul className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto z-20">
                        {citySuggestions.map((city) => (
                          <li
                            key={city}
                            className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm text-gray-800"
                            onClick={() => handleSelectSuggestion(city)}
                          >
                            {city}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-sm font-bold text-blue-700 mb-2 tracking-wide">Arrivée</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-yellow-400 group-hover:scale-110 transition-transform duration-200" />
                    <input
                      type="date"
                      value={searchFilters.checkIn}
                      onChange={(e) => handleFilterChange("checkIn", e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-xl text-blue-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200 bg-white/90 shadow-sm hover:shadow-lg animate-glow"
                    />
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-sm font-bold text-blue-700 mb-2 tracking-wide">Départ</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-yellow-400 group-hover:scale-110 transition-transform duration-200" />
                    <input
                      type="date"
                      value={searchFilters.checkOut}
                      onChange={(e) => handleFilterChange("checkOut", e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-xl text-blue-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200 bg-white/90 shadow-sm hover:shadow-lg animate-glow"
                    />
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-sm font-bold text-blue-700 mb-2 tracking-wide">Voyageurs</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-5 w-5 text-yellow-400 group-hover:scale-110 transition-transform duration-200" />
                    <input
                      type="number"
                      min={1}
                      value={searchFilters.guests || 1}
                      onChange={(e) => handleFilterChange("guests", Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-xl text-blue-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200 bg-white/90 shadow-sm hover:shadow-lg animate-glow"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white font-bold rounded-xl shadow-xl hover:from-yellow-500 hover:to-yellow-700 hover:scale-105 transition-all duration-200 focus:ring-4 focus:ring-yellow-200 animate-glow text-lg"
                  onClick={() => fetchHotels()}
                  disabled={searching}
                  className={`inline-flex items-center px-8 py-3 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white font-bold rounded-xl shadow-xl hover:from-yellow-500 hover:to-yellow-700 hover:scale-105 transition-all duration-200 focus:ring-4 focus:ring-yellow-200 animate-glow text-lg ${searching ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {searching ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                      Recherche...
                    </>
                  ) : (
                    <>
                      <Search className="w-6 h-6 mr-2 animate-bounce-x" />
                      Rechercher
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Advanced Filters Sidebar */}
            <div className={`lg:w-80 ${showFilters ? "block" : "hidden lg:block"}`}>
              <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6 sticky top-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Filter Results</h3>

                {/* Price Range */}
                <div className="mb-8">
                  <h4 className="font-semibold text-gray-900 mb-4">Gamme de Prix (par nuit)</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">0 MAD</span>
                      <span className="text-sm text-gray-600">10000+ MAD</span>
                    </div>
                    
                    {/* Min Price Slider */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Prix minimum</label>
                      <input
                        type="range"
                        min="0"
                        max="10000"
                        value={searchFilters.priceRange[0]}
                        onChange={(e) => handlePriceRangeChange(Number.parseInt(e.target.value), searchFilters.priceRange[1])}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                    
                    {/* Max Price Slider */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Prix maximum</label>
                      <input
                        type="range"
                        min="0"
                        max="10000"
                        value={searchFilters.priceRange[1]}
                        onChange={(e) => handlePriceRangeChange(searchFilters.priceRange[0], Number.parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm font-medium text-gray-900">
                      <span>{formatCurrencyMAD(searchFilters.priceRange[0])}</span>
                      <span>{formatCurrencyMAD(searchFilters.priceRange[1])}</span>
                    </div>
                  </div>
                </div>

                {/* Star Rating */}
                <div className="mb-8">
                  <h4 className="font-semibold text-gray-900 mb-4">Note Minimum</h4>
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <label key={rating} className="flex items-center cursor-pointer group">
                        <input
                          type="radio"
                          name="rating"
                          value={rating}
                          checked={searchFilters.rating === rating}
                          onChange={(e) => handleRatingChange(Number(e.target.value))}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 transition-colors"
                        />
                        <div className="ml-3 flex items-center">
                          {[...Array(rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                          ))}
                          <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                            {rating} étoile{rating > 1 ? "s" : ""} et plus
                          </span>
                        </div>
                      </label>
                    ))}
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="rating"
                        value={0}
                        checked={searchFilters.rating === 0}
                        onChange={(e) => handleRatingChange(0)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 transition-colors"
                      />
                      <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                        Toutes les notes
                      </span>
                    </label>
                  </div>
                </div>

                {/* Amenities */}
                <div className="mb-8">
                  <h4 className="font-semibold text-gray-900 mb-4">Équipements</h4>
                  <div className="space-y-3">
                    {Object.entries(amenityIcons).map(([key, Icon]) => (
                      <label key={key} className="flex items-center cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={searchFilters.amenities && searchFilters.amenities.includes(key)}
                          onChange={(e) => {
                            const currentAmenities = searchFilters.amenities || []
                            const newAmenities = e.target.checked
                              ? [...currentAmenities, key]
                              : currentAmenities.filter((a) => a !== key)
                            handleFilterChange("amenities", newAmenities)
                          }}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 transition-colors"
                        />
                        <Icon className="h-5 w-5 ml-3 text-gray-500 group-hover:text-primary-600 transition-colors" />
                        <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 transition-colors capitalize">
                          {key === "wifi" ? "WiFi" : key === "parking" ? "Parking" : key === "restaurant" ? "Restaurant" : key === "pool" ? "Piscine" : key}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={() => {
                    updateSearchFilters({
                      location: "",
                      checkIn: "",
                      checkOut: "",
                      guests: 1,
                      priceRange: [0, 10000],
                      amenities: [],
                      rating: 0
                    })
                    setSearchQuery("")
                    setCurrentPage(1)
                  }}
                  className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 font-medium transition-colors rounded-lg"
                >
                  Effacer tous les filtres
                </button>
              </div>
            </div>

            {/* Results Section */}
            <div className="flex-1">
              {/* Results Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {searching ? "Recherche en cours..." : loading ? "Chargement..." : `${totalHotels} propriétés trouvées`}
                  </h2>
                  {searchFilters.location && <p className="text-gray-600 mt-1">à {searchFilters.location}</p>}
                  {totalPages > 1 && (
                    <p className="text-sm text-gray-500 mt-1">
                      Page {currentPage} sur {totalPages}
                    </p>
                  )}
                </div>

                <div className="mt-4 sm:mt-0">
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-white border border-gray-300 rounded-xl px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Hotels Grid */}
              {loading || searching ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-300 rounded-xl shadow-soft p-6 animate-pulse">
                      <div className="h-48 bg-gray-400 rounded-xl mb-4"></div>
                      <div className="h-4 bg-gray-400 rounded mb-2"></div>
                      <div className="h-4 bg-gray-400 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : hotels.length === 0 ? (
                <div className="text-center py-16">
                  <div className="bg-white rounded-2xl shadow-soft p-12 max-w-md mx-auto">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No hotels found</h3>
                    <p className="text-gray-600 mb-6">
                      Try adjusting your search criteria or filters to find more options.
                    </p>
                    <button
                      onClick={() =>
                        updateSearchFilters({
                          location: "",
                          checkIn: "",
                          checkOut: "",
                          guests: 1,
                          priceRange: [0, 1000],
                          amenities: [],
                        })
                      }
                      className="btn-primary"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {hotels.map((hotel) => (
                    <Link key={hotel._id} to={`/hotels/${hotel._id}`} className="bg-white rounded-xl shadow-soft overflow-hidden group hover:shadow-medium transition-shadow duration-300">
                      <div className="relative">
                        <img
                          src={hotel.images[0]}
                          alt={hotel.name}
                          className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-medium text-primary-600">
                          {formatCurrencyMAD(hotel.pricePerNight)} / nuit
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary-600 transition-colors">
                          {hotel.name}
                        </h3>
                        <div className="flex items-center mb-2">
                          <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                          <span className="text-gray-600">{hotel.location}</span>
                        </div>
                        <div className="flex items-center mb-4">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="ml-1 text-sm text-gray-600">{hotel.rating}/5</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {hotel.amenities.map((amenity) => {
                            const Icon = amenityIcons[amenity]
                            return Icon ? (
                              <div key={amenity} className="flex items-center text-sm text-gray-600">
                                <Icon className="h-4 w-4 mr-1" />
                                <span className="capitalize">{amenity}</span>
                              </div>
                            ) : null
                          })}
                        </div>
                        <div className="flex items-center text-primary-600 font-medium">
                          Voir les détails
                          <ArrowRight className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <nav className="flex items-center space-x-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Précédent
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first page, last page, current page, and pages around current page
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                              page === currentPage
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return <span key={page} className="px-2 text-gray-500">...</span>
                      }
                      return null
                    })}

                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Suivant
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hotels
