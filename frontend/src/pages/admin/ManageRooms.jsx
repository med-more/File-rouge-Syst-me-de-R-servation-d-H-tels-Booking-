import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Eye, 
  Bed, 
  Users, 
  DollarSign,
  MapPin,
  Calendar,
  Wifi,
  Car,
  Coffee,
  Waves
} from 'lucide-react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { toast } from 'react-toastify';
import { formatCurrencyMAD } from '../../utils/helpers';
import AdminLayout from '../../components/layout/AdminLayout';

const roomSchema = Yup.object({
  hotelId: Yup.string().required("Hotel selection is required"),
  name: Yup.string().required("Room name is required"),
  type: Yup.string().required("Room type is required"),
  description: Yup.string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be at most 500 characters"),
  pricePerNight: Yup.number().min(1).required("Price is required"),
  maxGuests: Yup.number().min(1).max(10).required("Max guests is required"),
  quantity: Yup.number().min(1).required("Quantity is required"),
  size: Yup.number().min(1).optional(),
  floor: Yup.number().min(1).optional(),
})

const ManageRooms = () => {
  const [searchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add"); // add, edit, view
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterHotel, setFilterHotel] = useState("");
  const [filterType, setFilterType] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);

  const roomTypes = [
    'single', 'double', 'triple', 'suite', 'family', 'deluxe', 'presidential'
  ];

  const amenityOptions = [
    'wifi', 'tv', 'air_conditioning', 'heating', 'minibar', 'safe', 'balcony',
    'ocean_view', 'mountain_view', 'city_view', 'garden_view', 'kitchen',
    'living_room', 'bathroom', 'shower', 'bathtub', 'hair_dryer', 'towels',
    'bedding', 'desk', 'wardrobe', 'telephone', 'alarm_clock', 'coffee_maker',
    'iron', 'ironing_board', 'laundry_service', 'room_service', 'breakfast_included',
    'free_cancellation', 'non_smoking', 'accessible', 'connecting_rooms', 'adjoining_rooms'
  ];

  useEffect(() => {
    fetchRooms();
    fetchHotels();
  }, []);

  // Handle edit parameter from URL
  useEffect(() => {
    const editRoomId = searchParams.get('edit');
    if (editRoomId && rooms.length > 0) {
      const roomToEdit = rooms.find(room => room._id === editRoomId);
      if (roomToEdit) {
        openModal("edit", roomToEdit);
      }
    }
  }, [searchParams, rooms]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('http://localhost:5000/api/rooms');
      console.log('Fetched rooms data:', data.rooms);
      setRooms(data.rooms || []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast.error("Error fetching rooms");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHotels = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/admin/hotels');
      setHotels(data.hotels || []);
    } catch (error) {
      console.error("Error fetching hotels:", error);
    }
  };

  const openModal = (type, room = null) => {
    setModalType(type);
    setSelectedRoom(room);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRoom(null);
    setModalType("add");
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const payload = {
        ...values,
        pricePerNight: Number(values.pricePerNight),
        maxGuests: Number(values.maxGuests),
        quantity: Number(values.quantity),
        size: values.size ? Number(values.size) : undefined,
        floor: values.floor ? Number(values.floor) : undefined,
        amenities: values.amenities || [],
        images: values.images || []
      };

      console.log('Room creation payload:', payload);

      if (modalType === "add") {
        await axios.post('http://localhost:5000/api/rooms', payload);
        toast.success("Room created successfully!");
      } else {
        await axios.put(`http://localhost:5000/api/rooms/${selectedRoom._id}`, payload);
        toast.success("Room updated successfully!");
      }

      fetchRooms();
      closeModal();
      resetForm();
    } catch (error) {
      console.error('Room creation error:', error.response?.data);
      
      if (error.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = error.response.data.errors.map(err => err.msg).join(', ');
        toast.error(`Validation errors: ${validationErrors}`);
      } else {
        const errorMsg = error.response?.data?.message || "Failed to save room";
        toast.error(errorMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (room) => {
    setRoomToDelete(room);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/rooms/${roomToDelete._id}`);
      toast.success("Room deleted successfully!");
      fetchRooms();
      setShowDeleteDialog(false);
      setRoomToDelete(null);
    } catch (error) {
      toast.error("Failed to delete room");
    }
  };

  const getHotelName = (hotelId) => {
    // Handle both string ID and populated hotel object
    if (typeof hotelId === 'object' && hotelId !== null) {
      return hotelId.name || 'Unknown Hotel';
    }
    const hotel = hotels.find(h => h._id === hotelId);
    return hotel ? hotel.name : 'Unknown Hotel';
  };

  const getHotelId = (hotelId) => {
    // Handle both string ID and populated hotel object
    if (typeof hotelId === 'object' && hotelId !== null) {
      return hotelId._id;
    }
    return hotelId;
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesHotel = !filterHotel || getHotelId(room.hotelId) === filterHotel;
    const matchesType = !filterType || room.type === filterType;

    return matchesSearch && matchesHotel && matchesType;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-300 rounded w-1/4"></div>
              <div className="h-16 bg-gray-300 rounded-2xl"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-20 bg-gray-300 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
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
                  <h1 className="text-3xl md:text-4xl font-extrabold text-black drop-shadow-lg mb-2">Room Management</h1>
                  <p className="text-lg text-blue-700/80">Manage all hotel rooms across your properties</p>
                </div>
                <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                  <button
                    onClick={() => openModal("add")}
                    className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 flex items-center"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Room
                  </button>
                </div>
              </div>
            </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search rooms..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hotel</label>
              <select
                value={filterHotel}
                onChange={(e) => setFilterHotel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Hotels</option>
                {hotels.map(hotel => (
                  <option key={hotel._id} value={hotel._id}>{hotel.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                {roomTypes.map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterHotel("");
                  setFilterType("");
                }}
                className="w-full px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Rooms Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hotel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price/Night
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Availability
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRooms.map((room) => (
                  <tr key={room._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{room.name}</div>
                        <div className="text-sm text-gray-500 capitalize">{room.type}</div>
                        <div className="text-xs text-gray-400 truncate max-w-xs">{room.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{getHotelName(room.hotelId)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{room.maxGuests}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrencyMAD(room.pricePerNight)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Bed className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{room.quantity || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        room.isAvailable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {room.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openModal("view", room)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openModal("edit", room)}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                          title="Edit Room"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(room)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete Room"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredRooms.length === 0 && (
            <div className="text-center py-12">
              <Bed className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No rooms found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterHotel || filterType 
                  ? "Try adjusting your search or filters." 
                  : "Get started by creating a new room."}
              </p>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {modalType === "add" ? "Add New Room" : 
                     modalType === "edit" ? "Edit Room" : "Room Details"}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {modalType === "view" ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedRoom?.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Type</label>
                        <p className="mt-1 text-sm text-gray-900 capitalize">{selectedRoom?.type}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedRoom?.description}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Price/Night</label>
                        <p className="mt-1 text-sm text-gray-900">{formatCurrencyMAD(selectedRoom?.pricePerNight)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Max Guests</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedRoom?.maxGuests}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Quantity</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedRoom?.quantity}</p>
                      </div>
                    </div>
                    {selectedRoom?.size && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Size</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedRoom.size} m²</p>
                      </div>
                    )}
                    {selectedRoom?.floor && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Floor</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedRoom.floor}</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Hotel</label>
                      <p className="mt-1 text-sm text-gray-900">{getHotelName(selectedRoom?.hotelId)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedRoom?.isAvailable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedRoom?.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <Formik
                    initialValues={{
                      hotelId: getHotelId(selectedRoom?.hotelId) || "",
                      name: selectedRoom?.name || "",
                      type: selectedRoom?.type || "",
                      description: selectedRoom?.description || "",
                      pricePerNight: selectedRoom?.pricePerNight || "",
                      maxGuests: selectedRoom?.maxGuests || "",
                      quantity: selectedRoom?.quantity || "",
                      size: selectedRoom?.size || "",
                      floor: selectedRoom?.floor || "",
                      amenities: selectedRoom?.amenities || [],
                      images: selectedRoom?.images || []
                    }}
                    validationSchema={roomSchema}
                    onSubmit={handleSubmit}
                  >
                    {({ values, setFieldValue, isSubmitting }) => (
                      <Form className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Hotel *
                            </label>
                            <Field
                              as="select"
                              name="hotelId"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                              <option value="">Select Hotel</option>
                              {hotels.map(hotel => (
                                <option key={hotel._id} value={hotel._id}>{hotel.name}</option>
                              ))}
                            </Field>
                            <ErrorMessage name="hotelId" component="div" className="text-red-500 text-xs mt-1" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Room Name *
                            </label>
                            <Field
                              type="text"
                              name="name"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              placeholder="e.g., Deluxe Ocean View"
                            />
                            <ErrorMessage name="name" component="div" className="text-red-500 text-xs mt-1" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Room Type *
                            </label>
                            <Field
                              as="select"
                              name="type"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                              <option value="">Select Type</option>
                              {roomTypes.map(type => (
                                <option key={type} value={type}>
                                  {type.charAt(0).toUpperCase() + type.slice(1)}
                                </option>
                              ))}
                            </Field>
                            <ErrorMessage name="type" component="div" className="text-red-500 text-xs mt-1" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Price per Night (MAD) *
                            </label>
                            <Field
                              type="number"
                              name="pricePerNight"
                              min="1"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              placeholder="500"
                            />
                            <ErrorMessage name="pricePerNight" component="div" className="text-red-500 text-xs mt-1" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description * ({values.description?.length || 0}/500)
                          </label>
                          <Field
                            as="textarea"
                            name="description"
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Describe the room features and amenities (minimum 10 characters)..."
                          />
                          <ErrorMessage name="description" component="div" className="text-red-500 text-xs mt-1" />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Max Guests *
                            </label>
                            <Field
                              type="number"
                              name="maxGuests"
                              min="1"
                              max="10"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              placeholder="2"
                            />
                            <ErrorMessage name="maxGuests" component="div" className="text-red-500 text-xs mt-1" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Quantity *
                            </label>
                            <Field
                              type="number"
                              name="quantity"
                              min="1"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              placeholder="5"
                            />
                            <ErrorMessage name="quantity" component="div" className="text-red-500 text-xs mt-1" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Size (m²)
                            </label>
                            <Field
                              type="number"
                              name="size"
                              min="1"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              placeholder="25"
                            />
                            <ErrorMessage name="size" component="div" className="text-red-500 text-xs mt-1" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Floor
                          </label>
                          <Field
                            type="number"
                            name="floor"
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="3"
                          />
                          <ErrorMessage name="floor" component="div" className="text-red-500 text-xs mt-1" />
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                          <button
                            type="button"
                            onClick={closeModal}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                          >
                            {isSubmitting ? "Saving..." : modalType === "add" ? "Create Room" : "Update Room"}
                          </button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mt-4">Delete Room</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete "{roomToDelete?.name}"? This action cannot be undone.
                  </p>
                </div>
                <div className="flex justify-center space-x-3 mt-4">
                  <button
                    onClick={() => setShowDeleteDialog(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManageRooms;
