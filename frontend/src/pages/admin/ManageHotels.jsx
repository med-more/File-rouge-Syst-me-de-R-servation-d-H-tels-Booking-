"use client"

import { useState, useEffect } from "react"
import { Formik, Form, Field, ErrorMessage } from "formik"
import { formatCurrencyMAD } from "../../utils/helpers"
import * as Yup from "yup"
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  MapPin,
  Star,
  Eye,
  X,
  Upload,
  Wifi,
  Car,
  Coffee,
  Waves,
} from "lucide-react"
import axios from "axios"
import { toast } from "react-toastify"
import AdminLayout from "../../components/layout/AdminLayout"

const HotelSchema = Yup.object().shape({
  name: Yup.string().required("Hotel name is required"),
  location: Yup.string().required("Location is required"),
  description: Yup.string().required("Description is required"),
  pricePerNight: Yup.number().min(1, "Price must be greater than 0").required("Price is required"),
  rating: Yup.number().min(1).max(5).required("Rating is required"),
  amenities: Yup.array().min(1, "At least one amenity is required"),
})

const RoomSchema = Yup.object().shape({
  name: Yup.string().required("Room name is required"),
  type: Yup.string().oneOf(['single','double','triple','suite','family','deluxe','presidential']).required("Room type is required"),
  description: Yup.string().min(10, "Description must be at least 10 characters").required("Room description is required"),
  pricePerNight: Yup.number().min(1, "Price must be greater than 0").required("Price is required"),
  maxGuests: Yup.number().min(1).max(10).required("Max guests is required"),
  quantity: Yup.number().min(1).required("Quantity is required"),
})

const ManageHotels = () => {
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState("add") // add, edit, view, addRoom
  const [selectedHotel, setSelectedHotel] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterLocation, setFilterLocation] = useState("")
  const [filterRating, setFilterRating] = useState("")
  const [selectedImages, setSelectedImages] = useState([])
  const [imagePreview, setImagePreview] = useState([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [hotelToDelete, setHotelToDelete] = useState(null)

  const amenityOptions = [
    { key: "wifi", label: "WiFi", icon: Wifi },
    { key: "parking", label: "Parking", icon: Car },
    { key: "restaurant", label: "Restaurant", icon: Coffee },
    { key: "pool", label: "Swimming Pool", icon: Waves },
  ]

  const roomTypes = ["Standard Room", "Deluxe Room", "Suite", "Executive Suite", "Presidential Suite"]

  useEffect(() => {
    fetchHotels()
  }, [])

  const fetchHotels = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get('http://localhost:5000/api/admin/hotels')
      const apiHotels = Array.isArray(data?.hotels) ? data.hotels : []
      setHotels(apiHotels)
    } catch (error) {
      console.error("Erreur lors du chargement des hôtels:", error)
      toast.error(error.response?.data?.message || "Erreur lors du chargement des hôtels")
      setHotels([])
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files)
    // Concaténer avec les images déjà sélectionnées
    const newSelected = [...selectedImages, ...files]
    setSelectedImages(newSelected)

    // Convertir en Data URLs (base64) pour sauvegarde JSON
    const readers = files.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result)
          reader.readAsDataURL(file)
        })
    )
    Promise.all(readers).then((results) => setImagePreview((prev) => [...prev, ...results]))
  }

  const handleRemoveImage = (indexToRemove) => {
    setImagePreview((prev) => prev.filter((_, i) => i !== indexToRemove))
    setSelectedImages((prev) => prev.filter((_, i) => i !== indexToRemove))
  }

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const payload = {
        name: values.name,
        location: values.location,
        description: values.description,
        pricePerNight: Number(values.pricePerNight),
        rating: Number(values.rating),
        amenities: values.amenities,
        images: imagePreview, // base64 data URLs
      }

      if (modalType === "add") {
        await axios.post("http://localhost:5000/api/admin/hotels", payload)
        toast.success("Hotel added successfully!")
      } else if (modalType === "edit") {
        await axios.put(`http://localhost:5000/api/admin/hotels/${selectedHotel._id}`, payload)
        toast.success("Hotel updated successfully!")
      }

      fetchHotels()
      setShowModal(false)
      resetForm()
      setSelectedImages([])
      setImagePreview([])
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed")
    } finally {
      setSubmitting(false)
    }
  }

  const handleRoomSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      // Guard côté UI pour feedback immédiat
      if (!values.name || !values.type || !values.description || !values.pricePerNight || !values.maxGuests || !values.quantity) {
        toast.error("Veuillez remplir tous les champs de la chambre")
        return
      }
      console.log('AddRoom submit payload preview:', { hotelId: selectedHotel?._id, ...values })
      const payload = {
        hotelId: selectedHotel._id,
        name: values.name,
        type: values.type,
        description: values.description,
        pricePerNight: Number(values.pricePerNight),
        maxGuests: Number(values.maxGuests),
        quantity: Number(values.quantity),
        amenities: [],
        images: [],
      }
      await axios.post('http://localhost:5000/api/rooms', payload)
      toast.success("Room added successfully!")
      fetchHotels()
      setShowModal(false)
      resetForm()
    } catch (error) {
      const serverMsg = error.response?.data?.errors?.[0]?.msg || error.response?.data?.message
      toast.error(serverMsg || "Failed to add room")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (hotelId) => {
    setShowDeleteDialog(true)
    setHotelToDelete(hotelId)
  }

  const confirmDelete = async () => {
    if (!hotelToDelete) return
    try {
      await axios.delete(`http://localhost:5000/api/admin/hotels/${hotelToDelete}`)
      toast.success("Hotel deleted successfully!")
      fetchHotels()
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.code === 'ACTIVE_BOOKINGS_EXIST') {
        const activeBookings = error.response.data.activeBookings
        const shouldForceDelete = window.confirm(
          `This hotel has ${activeBookings} active bookings. Do you want to force delete it? This will cancel all active bookings.`
        )
        if (shouldForceDelete) {
          try {
            await axios.delete(`http://localhost:5000/api/admin/hotels/${hotelToDelete}?force=true`)
            toast.success(`Hotel deleted successfully! ${activeBookings} active bookings were cancelled.`)
            fetchHotels()
          } catch (forceError) {
            toast.error("Failed to force delete hotel")
          }
        }
      } else {
        toast.error(error.response?.data?.message || "Failed to delete hotel")
      }
    } finally {
      setShowDeleteDialog(false)
      setHotelToDelete(null)
    }
  }

  const openModal = (type, hotel = null) => {
    setModalType(type)
    setSelectedHotel(hotel)
    setShowModal(true)
    // Pré-remplir les images existantes en mode édition/affichage
    if (type === 'edit' && hotel) {
      setSelectedImages([])
      setImagePreview(Array.isArray(hotel.images) ? hotel.images : [])
    } else {
      setSelectedImages([])
      setImagePreview([])
    }
  }

  const filteredHotels = hotels?.filter((hotel) => {
    const matchesSearch =
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLocation = !filterLocation || hotel.location.toLowerCase().includes(filterLocation.toLowerCase())
    const matchesRating = !filterRating || Number(hotel.rating) >= Number(filterRating)
    return matchesSearch && matchesLocation && matchesRating
  }) || []

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
                <h1 className="text-3xl md:text-4xl font-extrabold text-black drop-shadow-lg mb-2">Manage Hotels</h1>
                <p className="text-lg text-blue-700/80">Add, edit, and manage hotel listings</p>
          </div>
              <button onClick={() => openModal("add")} className="bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-xl shadow-lg px-6 py-3 font-semibold flex items-center gap-2 hover:from-blue-700 hover:to-blue-500 transition-all duration-200 mt-4 sm:mt-0 animate-fade-in-up">
                <Plus className="h-5 w-5 mr-2" />
            Add Hotel
          </button>
            </div>
        </div>

        {/* Filters */}
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl border-2 border-blue-200/30 p-6 mb-8 animate-fade-in-up">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search hotels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Filter by location..."
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <div>
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="input-field"
              >
                <option value="">All ratings</option>
                <option value="5">★ 5+</option>
                <option value="4">★ 4+</option>
                <option value="3">★ 3+</option>
                <option value="2">★ 2+</option>
                <option value="1">★ 1+</option>
              </select>
            </div>
              <div className="flex items-center text-sm text-blue-700 font-semibold">
              <Filter className="h-4 w-4 mr-2" />
              {filteredHotels.length} of {hotels.length} hotels
            </div>
          </div>
        </div>

        {/* Hotels Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white/80 backdrop-blur rounded-2xl shadow-xl border-2 border-blue-200/30 p-6 animate-pulse">
                  <div className="h-48 bg-gray-300 rounded-2xl mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
            {filteredHotels.map((hotel) => (
                <div key={hotel._id} className="bg-white/80 backdrop-blur rounded-2xl shadow-xl border-2 border-blue-200/30 overflow-hidden animate-fade-in-up hover:shadow-2xl hover:scale-105 transition-all duration-300">
                <img
                  src={hotel.images[0] || "/placeholder.svg?height=200&width=400"}
                  alt={hotel.name}
                    className="w-full h-48 object-cover rounded-t-2xl"
                />
                <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{hotel.name}</h3>
                  <div className="flex items-center mb-2">
                      <MapPin className="h-4 w-4 text-blue-500 mr-1" />
                      <span className="text-blue-700 font-semibold">{hotel.location}</span>
                  </div>
                  <div className="flex items-center mb-3">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm text-gray-600">{hotel.rating}/5</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-extrabold text-blue-700">{formatCurrencyMAD(hotel.pricePerNight)}</span>
                    <span className="text-sm text-gray-500">{hotel.rooms?.length || 0} rooms</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openModal("view", hotel)}
                        className="flex-1 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-xl font-semibold flex items-center justify-center gap-1 py-2 px-3 shadow hover:from-blue-200 hover:to-blue-300 transition-all duration-200"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => openModal("edit", hotel)}
                        className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-300 text-yellow-900 rounded-xl font-semibold flex items-center justify-center gap-1 py-2 px-3 shadow hover:from-yellow-300 hover:to-yellow-200 transition-all duration-200"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(hotel._id)}
                        className="px-3 py-2 bg-gradient-to-r from-red-500 to-red-400 text-white rounded-xl font-semibold shadow hover:from-red-600 hover:to-red-500 transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

          {/* Modal principal */}
        {showModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0 animate-fade-in"></div>
              <div className="relative z-10 w-full max-w-lg mt-2">
                <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border-2 border-blue-200/60 p-4 animate-fade-in-up max-h-[70vh] flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-extrabold text-blue-700">
                  {modalType === "add" && "Add New Hotel"}
                  {modalType === "edit" && "Edit Hotel"}
                  {modalType === "view" && "Hotel Details"}
                  {modalType === "addRoom" && "Add Room"}
                </h2>
                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500 bg-white/70 rounded-full p-2 shadow border border-blue-100">
                  <X className="h-6 w-6" />
                </button>
              </div>
                  <div className="overflow-y-auto flex-1 pr-1">
                {(modalType === "add" || modalType === "edit") && (
                  <Formik
                    initialValues={{
                      name: selectedHotel?.name || "",
                      location: selectedHotel?.location || "",
                      description: selectedHotel?.description || "",
                      pricePerNight: selectedHotel?.pricePerNight || "",
                      rating: selectedHotel?.rating || 5,
                      amenities: selectedHotel?.amenities || [],
                    }}
                    validationSchema={HotelSchema}
                    onSubmit={handleSubmit}
                    enableReinitialize
                  >
                    {({ values, setFieldValue, isSubmitting }) => (
                          <Form className="space-y-4">
                            {/* Ligne décorative animée */}
                            <div className="h-1 w-16 bg-gradient-to-r from-blue-400 via-blue-200 to-yellow-200 rounded-full mx-auto mb-1 animate-fade-in" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                                <label className="block text-base font-semibold text-blue-700 mb-1">Nom de l'hôtel</label>
                                <Field name="name" className="input-field rounded-xl border-2 border-blue-200/40 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 py-2 text-sm" placeholder="Nom de l'hôtel" />
                                <ErrorMessage name="name" component="div" className="mt-0.5 text-xs text-red-600 animate-fade-in" />
                          </div>

                          <div>
                                <label className="block text-base font-semibold text-blue-700 mb-1">Localisation</label>
                                <Field name="location" className="input-field rounded-xl border-2 border-blue-200/40 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 py-2 text-sm" placeholder="Ville, pays..." />
                                <ErrorMessage name="location" component="div" className="mt-0.5 text-xs text-red-600 animate-fade-in" />
                          </div>
                        </div>

                        <div>
                                <label className="block text-base font-semibold text-blue-700 mb-1">Description</label>
                          <Field
                            as="textarea"
                            name="description"
                                  rows={2}
                                  className="input-field resize-none rounded-xl border-2 border-blue-200/40 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 py-2 text-sm min-h-[40px] max-h-[60px]"
                                  placeholder="Décrivez l'hôtel, ses atouts..."
                          />
                                <ErrorMessage name="description" component="div" className="mt-0.5 text-xs text-red-600 animate-fade-in" />
                        </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                                <label className="block text-base font-semibold text-blue-700 mb-1">Prix par nuit (MAD)</label>
                            <Field
                              name="pricePerNight"
                              type="number"
                                  className="input-field rounded-xl border-2 border-blue-200/40 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 py-2 text-sm"
                                  placeholder="Prix en MAD"
                            />
                                <ErrorMessage name="pricePerNight" component="div" className="mt-0.5 text-xs text-red-600 animate-fade-in" />
                          </div>

                          <div>
                                <label className="block text-base font-semibold text-blue-700 mb-1">Note</label>
                                <Field as="select" name="rating" className="input-field rounded-xl border-2 border-blue-200/40 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 py-2 text-sm">
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <option key={rating} value={rating}>
                                      {rating} étoile{rating > 1 ? "s" : ""}
                                </option>
                              ))}
                            </Field>
                                <ErrorMessage name="rating" component="div" className="mt-0.5 text-xs text-red-600 animate-fade-in" />
                          </div>
                        </div>

                        <div>
                              <label className="block text-base font-semibold text-blue-700 mb-1">Équipements</label>
                              <div className="flex flex-wrap gap-2">
                            {amenityOptions.map((amenity) => (
                                  <label key={amenity.key} className={`flex items-center px-2 py-1 rounded-xl shadow border-2 cursor-pointer transition-all duration-200 text-xs
                                    ${values.amenities.includes(amenity.key)
                                      ? 'bg-blue-100 border-blue-400 text-blue-700 scale-105'
                                      : 'bg-white border-blue-200 text-gray-500 hover:bg-blue-50'} animate-fade-in`}>
                                <input
                                  type="checkbox"
                                  checked={values.amenities.includes(amenity.key)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFieldValue("amenities", [...values.amenities, amenity.key])
                                    } else {
                                      setFieldValue(
                                        "amenities",
                                        values.amenities.filter((a) => a !== amenity.key),
                                      )
                                    }
                                  }}
                                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-400 mr-1"
                                />
                                    <amenity.icon className="h-4 w-4 mr-1" />
                                    <span className="font-medium">{amenity.label}</span>
                              </label>
                            ))}
                          </div>
                              <ErrorMessage name="amenities" component="div" className="mt-0.5 text-xs text-red-600 animate-fade-in" />
                        </div>

                        <div>
                              <label className="block text-base font-semibold text-blue-700 mb-1">Images de l'hôtel</label>
                              <div className="border-2 border-dashed border-blue-200/60 rounded-2xl p-4 flex flex-col items-center justify-center bg-blue-50/30 hover:bg-blue-100/40 transition-all duration-200 cursor-pointer animate-fade-in">
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                              id="hotel-images"
                            />
                                <label htmlFor="hotel-images" className="flex flex-col items-center cursor-pointer">
                                  <Upload className="h-7 w-7 text-blue-400 mb-1 animate-bounce" />
                                  <span className="text-xs text-blue-700 font-medium">Cliquez ou glissez-déposez pour ajouter des images</span>
                            </label>
                          </div>
                          {imagePreview.length > 0 && (
                                <div className="grid grid-cols-3 gap-2 mt-2">
                              {imagePreview.map((preview, index) => (
                                <div key={index} className="relative w-14 h-14 rounded-lg border border-blue-200 shadow flex items-center justify-center bg-white">
                                  <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveImage(index)}
                                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                            <div className="flex justify-end space-x-2 mt-4">
                              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl font-semibold bg-white border-2 border-blue-200 text-blue-700 shadow hover:bg-blue-50 transition-all duration-200 animate-fade-in text-sm">
                                Annuler
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                                className="px-6 py-2 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-lg hover:from-blue-700 hover:to-blue-500 transition-all duration-200 animate-fade-in disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                                {isSubmitting ? "Enregistrement..." : modalType === "add" ? "Créer l'hôtel" : "Mettre à jour"}
                          </button>
                        </div>
                            {/* Ligne décorative animée bas */}
                            <div className="h-1 w-16 bg-gradient-to-r from-yellow-200 via-blue-200 to-blue-400 rounded-full mx-auto mt-1 animate-fade-in" />
                      </Form>
                    )}
                  </Formik>
                )}

                {modalType === "view" && selectedHotel && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Hotel Information</h3>
                        <div className="space-y-3">
                          <div>
                            <span className="font-medium">Name:</span> {selectedHotel.name}
                          </div>
                          <div>
                            <span className="font-medium">Location:</span> {selectedHotel.location}
                          </div>
                          <div>
                            <span className="font-medium">Price per Night:</span> {formatCurrencyMAD(selectedHotel.pricePerNight)}
                          </div>
                          <div>
                            <span className="font-medium">Rating:</span> {selectedHotel.rating}/5
                          </div>
                          <div>
                            <span className="font-medium">Description:</span>
                            <p className="mt-1 text-gray-600">{selectedHotel.description}</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Amenities</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedHotel.amenities?.map((amenity) => {
                            const amenityOption = amenityOptions.find((a) => a.key === amenity)
                            return amenityOption ? (
                              <div key={amenity} className="flex items-center">
                                <amenityOption.icon className="h-4 w-4 mr-2" />
                                <span className="text-sm">{amenityOption.label}</span>
                              </div>
                            ) : null
                          })}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Rooms ({selectedHotel.rooms?.length || 0})</h3>
                        <button
                          onClick={() => openModal("addRoom", selectedHotel)}
                          className="btn-primary flex items-center"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Room
                        </button>
                      </div>
                      <div className="space-y-3">
                        {selectedHotel.rooms?.map((room) => (
                          <div key={room._id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{room.type}</h4>
                                <p className="text-sm text-gray-600">{room.description}</p>
                                <p className="text-sm text-gray-500">Max {room.maxGuests} guests</p>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-primary-600">{formatCurrencyMAD(room.pricePerNight)}/night</span>
                                <p className="text-sm text-gray-500">{room.quantity} available</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {modalType === "addRoom" && (
                  <Formik
                    initialValues={{
                      name: "",
                      type: "",
                      description: "",
                      pricePerNight: "",
                      maxGuests: 2,
                      quantity: 1,
                    }}
                    validationSchema={RoomSchema}
                    onSubmit={handleRoomSubmit}
                  >
                    {({ isSubmitting }) => (
                      <Form className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Room Name</label>
                          <Field name="name" className="input-field" placeholder="Enter room name" />
                          <ErrorMessage name="name" component="div" className="mt-1 text-sm text-red-600" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
                            <Field as="select" name="type" className="input-field">
                              <option value="">Select room type</option>
                              {['single','double','triple','suite','family','deluxe','presidential'].map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </Field>
                            <ErrorMessage name="type" component="div" className="mt-1 text-sm text-red-600" />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Price per Night (MAD)</label>
                            <Field
                              name="pricePerNight"
                              type="number"
                              className="input-field"
                              placeholder="Enter price in MAD"
                            />
                            <ErrorMessage name="pricePerNight" component="div" className="mt-1 text-sm text-red-600" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                          <Field
                            as="textarea"
                            name="description"
                            rows={3}
                            className="input-field resize-none"
                            placeholder="Enter room description"
                          />
                          <ErrorMessage name="description" component="div" className="mt-1 text-sm text-red-600" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Max Guests</label>
                            <Field as="select" name="maxGuests" className="input-field">
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                <option key={num} value={num}>
                                  {num} Guest{num > 1 ? "s" : ""}
                                </option>
                              ))}
                            </Field>
                            <ErrorMessage name="maxGuests" component="div" className="mt-1 text-sm text-red-600" />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                            <Field
                              name="quantity"
                              type="number"
                              min="1"
                              className="input-field"
                              placeholder="Number of rooms"
                            />
                            <ErrorMessage name="quantity" component="div" className="mt-1 text-sm text-red-600" />
                          </div>
                        </div>

                        <div className="flex justify-end space-x-4">
                          <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? "Adding..." : "Add Room"}
                          </button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                )}
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Dialog de confirmation suppression */}
          {showDeleteDialog && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0 animate-fade-in"></div>
              <div className="relative z-10 bg-white rounded-2xl shadow-2xl border-2 border-red-200/60 p-6 max-w-xs w-full animate-fade-in-up flex flex-col items-center">
                <div className="flex flex-col items-center">
                  <Trash2 className="h-10 w-10 text-red-500 mb-2" />
                  <h3 className="text-lg font-bold text-red-700 mb-2 text-center">Supprimer cet hôtel ?</h3>
                  <p className="text-sm text-gray-600 mb-4 text-center">Cette action est irréversible. Voulez-vous vraiment supprimer cet hôtel ?</p>
                </div>
                <div className="flex gap-3 mt-2">
                  <button onClick={() => { setShowDeleteDialog(false); setHotelToDelete(null); }} className="px-4 py-2 rounded-xl font-semibold bg-white border-2 border-blue-200 text-blue-700 shadow hover:bg-blue-50 transition-all duration-200 text-sm">Annuler</button>
                  <button onClick={confirmDelete} className="px-4 py-2 rounded-xl font-bold bg-gradient-to-r from-red-600 to-red-400 text-white shadow-lg hover:from-red-700 hover:to-red-500 transition-all duration-200 text-sm">Supprimer</button>
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

export default ManageHotels
