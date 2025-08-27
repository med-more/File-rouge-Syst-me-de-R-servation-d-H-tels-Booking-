"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  MapPin,
  Star,
  Wifi,
  Car,
  Coffee,
  Waves,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Bed,
  Bath,
  Phone,
  Mail,
  Clock,
  Shield,
} from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { useBooking } from "../contexts/BookingContext"
import axios from "axios"
import { formatCurrencyMAD } from "../utils/helpers"
import { toast } from "react-toastify"

const HotelDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { setCurrentBooking } = useBooking()

  const [hotel, setHotel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [bookingData, setBookingData] = useState({
    checkIn: "",
    checkOut: "",
    guests: 1,
  })
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  const amenityIcons = {
    wifi: { icon: Wifi, label: "Free WiFi" },
    parking: { icon: Car, label: "Free Parking" },
    restaurant: { icon: Coffee, label: "Restaurant" },
    pool: { icon: Waves, label: "Swimming Pool" },
    gym: { icon: Users, label: "Fitness Center" },
    spa: { icon: Heart, label: "Spa & Wellness" },
  }

  useEffect(() => {
    fetchHotelDetails()
    fetchHotelRooms()
  }, [id])

  // Vérifier la disponibilité quand les dates de réservation changent
  useEffect(() => {
    if (bookingData.checkIn && bookingData.checkOut && selectedRoom) {
      const timeoutId = setTimeout(() => {
        checkAvailability()
      }, 1000) // Délai de 1 seconde pour éviter trop d'appels API
      
      return () => clearTimeout(timeoutId)
    }
  }, [bookingData.checkIn, bookingData.checkOut, bookingData.guests])

  // Vérifier si l'hôtel est dans les favoris au chargement
  useEffect(() => {
    if (hotel && isAuthenticated) {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
      setIsFavorite(favorites.some((f) => f.id === hotel._id))
    }
  }, [hotel, isAuthenticated])

  const fetchHotelDetails = async () => {
    setLoading(true)
    try {
      // Appel API au backend pour récupérer les détails de l'hôtel
      const { data } = await axios.get(`http://localhost:5000/api/hotels/${id}`)
      
      if (data.hotel) {
        setHotel(data.hotel)
        if (data.hotel.rooms?.length > 0) {
          setSelectedRoom(data.hotel.rooms[0])
        }
      } else {
        toast.error("Hôtel non trouvé")
        navigate("/hotels")
      }
    } catch (error) {
      console.error("Erreur lors du chargement des détails de l'hôtel:", error)
      if (error.response?.status === 404) {
        toast.error("Hôtel non trouvé")
      } else {
        toast.error(error.response?.data?.message || "Erreur lors du chargement des détails de l'hôtel")
      }
      navigate("/hotels")
    } finally {
      setLoading(false)
    }
  }

  const fetchHotelRooms = async () => {
    try {
      // Récupérer les chambres de l'hôtel
      const { data } = await axios.get(`http://localhost:5000/api/hotels/${id}/rooms`)
      
      if (data.rooms) {
        // Mettre à jour l'hôtel avec les chambres récupérées
        setHotel(prevHotel => ({
          ...prevHotel,
          rooms: data.rooms
        }))
        
        if (data.rooms.length > 0) {
          setSelectedRoom(data.rooms[0])
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des chambres:", error)
      // Ne pas afficher d'erreur car l'hôtel peut ne pas avoir de chambres
    }
  }

  const checkAvailability = async () => {
    if (!bookingData.checkIn || !bookingData.checkOut || !selectedRoom) {
      return
    }
    
    try {
      const params = {
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: bookingData.guests
      }
      
      const { data } = await axios.get(`http://localhost:5000/api/hotels/${id}/availability`, { params })
      
      if (data.availability) {
        // Mettre à jour les chambres avec la disponibilité
        const updatedRooms = data.availability.map(room => ({
          ...room,
          isAvailable: room.isAvailable
        }))
        
        setHotel(prevHotel => ({
          ...prevHotel,
          rooms: updatedRooms
        }))
        
        // Vérifier si la chambre sélectionnée est toujours disponible
        const currentRoom = updatedRooms.find(room => room.type === selectedRoom.type)
        if (currentRoom && currentRoom.isAvailable) {
          setSelectedRoom(currentRoom)
        }
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de la disponibilité:", error)
      toast.error("Erreur lors de la vérification de la disponibilité")
    }
  }

  const calculateNights = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0
    const start = new Date(bookingData.checkIn)
    const end = new Date(bookingData.checkOut)
    const diffTime = Math.abs(end - start)
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const calculateTotal = () => {
    const nights = calculateNights()
    const roomPrice = selectedRoom?.pricePerNight || hotel?.pricePerNight || 0
    const subtotal = nights * roomPrice
    const taxes = subtotal * 0.12
    return {
      nights,
      roomPrice,
      subtotal,
      taxes,
      total: subtotal + taxes,
    }
  }

  const handleBooking = () => {
    if (!isAuthenticated) {
      toast.error("Veuillez vous connecter pour effectuer une réservation")
      return
    }

    if (!selectedRoom) {
      toast.error("Veuillez sélectionner une chambre")
      return
    }

    if (!bookingData.checkIn || !bookingData.checkOut) {
      toast.error("Veuillez sélectionner les dates d'arrivée et de départ")
      return
    }

    if (bookingData.guests > selectedRoom.maxGuests) {
      toast.error(`Cette chambre ne peut accueillir que ${selectedRoom.maxGuests} personnes maximum`)
      return
    }

    const booking = {
      hotelId: hotel._id,
      hotelName: hotel.name,
      hotelLocation: hotel.location,
      hotelImage: hotel.images?.[0],
      roomId: selectedRoom._id,
      roomType: selectedRoom.type,
      roomDescription: selectedRoom.description,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      guests: bookingData.guests,
      ...calculateTotal(),
    }

    setCurrentBooking(booking)
    navigate("/payment")
  }

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error("Veuillez vous connecter pour sauvegarder vos favoris")
      return
    }

    try {
      const stored = localStorage.getItem('favorites')
      const favorites = stored ? JSON.parse(stored) : []

      // Normaliser: tableau d'objets avec {id, name, image, location, pricePerNight, rating}
      const isObjectArray = favorites.every((f) => typeof f === 'object' && f !== null && 'id' in f)
      const normalized = isObjectArray
        ? favorites
        : favorites.map((id) => ({ id }))

      const exists = normalized.some((f) => f.id === hotel._id)
      if (exists) {
        const updated = normalized.filter((f) => f.id !== hotel._id)
        localStorage.setItem('favorites', JSON.stringify(updated))
        setIsFavorite(false)
        toast.success("Retiré des favoris")
      } else {
        const favoriteItem = {
          id: hotel._id,
          name: hotel.name,
          image: hotel.images?.[0] || '',
          location: hotel.location,
          pricePerNight: hotel.pricePerNight,
          rating: hotel.rating,
        }
        const updated = [...normalized, favoriteItem]
        localStorage.setItem('favorites', JSON.stringify(updated))
        setIsFavorite(true)
        toast.success("Ajouté aux favoris")
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour des favoris:", error)
      toast.error("Erreur lors de la mise à jour des favoris")
    }
  }

  const shareHotel = () => {
    if (navigator.share) {
      navigator.share({
        title: hotel.name,
        text: `Check out ${hotel.name} in ${hotel.location}`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard!")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-300"></div>
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-32 bg-gray-300 rounded"></div>
              </div>
              <div className="h-96 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Hotel not found</h2>
          <p className="text-gray-600 mb-4">The hotel you're looking for doesn't exist.</p>
          <button onClick={() => navigate("/hotels")} className="btn-primary">
            Back to Hotels
          </button>
        </div>
      </div>
    )
  }

  const pricing = calculateTotal()

  return (
    <div className="min-h-screen pt-32 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Spots - Style Contact */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      {/* Modern Image Carousel */}
      <div className="w-full max-w-5xl mx-auto mb-10 relative z-10">
        <div className="relative group rounded-3xl overflow-hidden shadow-2xl bg-white">
          <div className="relative h-96 md:h-[500px] flex items-center justify-center">
            <img
          src={hotel.images?.[selectedImageIndex] || "/placeholder.svg?height=500&width=1200"}
              alt={hotel.name}
              className="w-full h-full object-cover rounded-3xl transition-transform duration-500 group-hover:scale-105 shadow-xl"
              style={{transition:'transform 0.5s cubic-bezier(.4,2,.3,1)'}}
        />
            {/* Flèches glassmorphism */}
        {hotel.images && hotel.images.length > 1 && (
          <>
            <button
              onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? hotel.images.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/70 backdrop-blur-lg hover:bg-blue-600 hover:text-white text-blue-700 rounded-full p-4 shadow-xl border-2 border-white/60 transition-all duration-200 z-20"
            >
                  <ChevronLeft className="h-7 w-7" />
            </button>
            <button
              onClick={() => setSelectedImageIndex((prev) => (prev === hotel.images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/70 backdrop-blur-lg hover:bg-blue-600 hover:text-white text-blue-700 rounded-full p-4 shadow-xl border-2 border-white/60 transition-all duration-200 z-20"
            >
                  <ChevronRight className="h-7 w-7" />
            </button>
          </>
        )}
            {/* Indicateurs animés */}
        {hotel.images && hotel.images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
            {hotel.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                    className={`w-4 h-4 rounded-full border-2 border-white transition-all duration-300 ${
                      index === selectedImageIndex ? "bg-blue-600 scale-110 shadow-lg" : "bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
            {/* Action Buttons modern */}
            <div className="absolute top-6 right-6 flex space-x-3 z-20">
          <button
            onClick={shareHotel}
                className="bg-white/80 hover:bg-blue-600 hover:text-white text-blue-700 rounded-full p-3 shadow-xl border-2 border-white/60 transition-all duration-200"
          >
                <Share2 className="h-6 w-6" />
          </button>
          <button
            onClick={toggleFavorite}
                className={`bg-white/80 rounded-full p-3 shadow-xl border-2 border-white/60 transition-all duration-200 ${isFavorite ? 'hover:bg-red-500 hover:text-white text-red-500' : 'hover:bg-blue-600 hover:text-white text-blue-700'}`}
          >
                <Heart className={`h-6 w-6 ${isFavorite ? "fill-current" : ""}`} />
          </button>
            </div>
          </div>
          </div>
        </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hotel Header */}
            <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{hotel.name}</h1>
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span className="text-lg">{hotel.location}</span>
              </div>
                <div className="flex items-center">
                    <div className="flex items-center bg-primary-100 rounded-lg px-3 py-1">
                      <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                      <span className="font-semibold text-primary-800">{hotel.rating}</span>
                      <span className="text-primary-600 ml-1">/5</span>
                    </div>
                    <span className="text-gray-600 ml-3">Excellent (1,234 reviews)</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary-600">{formatCurrencyMAD(hotel.pricePerNight)}</div>
                  <div className="text-gray-600">par nuit</div>
                </div>
              </div>
              </div>

            {/* Description */}
            <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About this property</h2>
              <p className="text-gray-700 leading-relaxed text-lg">{hotel.description}</p>
            </div>

              {/* Amenities */}
            <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {hotel.amenities?.map((amenity) => {
                  const amenityInfo = amenityIcons[amenity]
                  if (!amenityInfo) return null

                  const Icon = amenityInfo.icon
                    return (
                    <div
                      key={amenity}
                      className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="bg-primary-100 rounded-lg p-2 mr-3">
                        <Icon className="h-5 w-5 text-primary-600" />
                      </div>
                      <span className="font-medium text-gray-900">{amenityInfo.label}</span>
                      </div>
                    )
                  })}
              </div>
            </div>

            {/* Rooms */}
            {hotel.rooms && hotel.rooms.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Chambres Disponibles</h2>
                <div className="space-y-4">
                  {hotel.rooms.map((room) => (
                    <div
                      key={room._id}
                      className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                        selectedRoom?._id === room._id
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-200 hover:border-gray-300"
                      } ${!room.isAvailable ? 'opacity-60 cursor-not-allowed' : ''}`}
                      onClick={() => room.isAvailable && setSelectedRoom(room)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">{room.type}</h3>
                            {room.isAvailable ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Disponible
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Indisponible
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-3">{room.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              <span>Jusqu'à {room.maxGuests} personnes</span>
                            </div>
                            <div className="flex items-center">
                              <Bed className="h-4 w-4 mr-1" />
                              <span>Lit king-size</span>
                            </div>
                            <div className="flex items-center">
                              <Bath className="h-4 w-4 mr-1" />
                              <span>Salle de bain privée</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-6">
                          <div className="text-2xl font-bold text-primary-600">{formatCurrencyMAD(room.pricePerNight)}</div>
                          <div className="text-gray-600">par nuit</div>
                          <div className="text-sm text-gray-500 mt-1">
                            {room.quantity || room.availableQuantity || 0} chambres disponibles
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bed className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune chambre disponible</h3>
                  <p className="text-gray-600">
                    Cet hôtel n'a pas encore de chambres configurées ou toutes les chambres sont actuellement indisponibles.
                  </p>
                </div>
              </div>
            )}

            {/* Policies */}
            <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Hotel Policies</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-primary-600" />
                    Check-in / Check-out
                  </h3>
                  <div className="space-y-2 text-gray-600">
                    <div>Check-in: 3:00 PM - 11:00 PM</div>
                    <div>Check-out: Until 11:00 AM</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-primary-600" />
                    Cancellation
                  </h3>
                  <div className="text-gray-600">Free cancellation until 24 hours before check-in</div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-2xl shadow-hard p-8 border border-gray-100">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-primary-600 mb-1">
                    {formatCurrencyMAD(selectedRoom?.pricePerNight || hotel.pricePerNight)}
                  </div>
                  <div className="text-gray-600">par nuit</div>
                </div>

                <div className="space-y-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date</label>
                  <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      value={bookingData.checkIn}
                      onChange={(e) => setBookingData((prev) => ({ ...prev, checkIn: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date</label>
                  <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      value={bookingData.checkOut}
                      onChange={(e) => setBookingData((prev) => ({ ...prev, checkOut: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      min={bookingData.checkIn || new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Guests</label>
                  <div className="relative">
                      <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <select
                      value={bookingData.guests}
                        onChange={(e) =>
                          setBookingData((prev) => ({ ...prev, guests: Number.parseInt(e.target.value) }))
                        }
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 appearance-none"
                    >
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <option key={num} value={num}>
                          {num} Guest{num > 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                    </div>

                {/* Price Breakdown */}
                {bookingData.checkIn && bookingData.checkOut && (
                  <div className="border-t border-gray-200 pt-6 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Détails du prix</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          {formatCurrencyMAD(pricing.roomPrice)} × {pricing.nights} nuit{pricing.nights > 1 ? "s" : ""}
                      </span>
                        <span className="text-gray-900">{formatCurrencyMAD(pricing.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Taxes & frais</span>
                        <span className="text-gray-900">{formatCurrencyMAD(pricing.taxes)}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-2 mt-2">
                        <div className="flex justify-between font-semibold text-lg">
                          <span className="text-gray-900">Total</span>
                          <span className="text-primary-600">{formatCurrencyMAD(pricing.total)}</span>
                        </div>
                    </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleBooking}
                  disabled={!bookingData.checkIn || !bookingData.checkOut}
                  className="w-full btn-primary py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
                >
                  Book Now
                </button>

                <div className="mt-4 text-center">
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    <Shield className="h-4 w-4 mr-1" />
                    <span>Free cancellation • No booking fees</span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100 mt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Need Help?</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-3" />
                    <span className="text-sm">+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-3" />
                    <span className="text-sm">support@hotelbook.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HotelDetails
