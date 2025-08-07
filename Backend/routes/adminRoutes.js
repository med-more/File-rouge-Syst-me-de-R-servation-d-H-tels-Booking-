const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Toutes les routes admin nécessitent une authentification et des droits admin
router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard et statistiques
router.get('/dashboard', adminController.getDashboardStats);

// Gestion des hôtels
router.get('/hotels', adminController.getHotels);
router.post('/hotels', adminController.createHotel);
router.get('/hotels/:id', adminController.getHotelById);
router.put('/hotels/:id', adminController.updateHotel);
router.delete('/hotels/:id', adminController.deleteHotel);
router.patch('/hotels/:id/status', adminController.updateHotelStatus);

// Gestion des réservations
router.get('/bookings', adminController.getBookings);
router.get('/bookings/:id', adminController.getBookingById);
router.put('/bookings/:id', adminController.updateBooking);
router.delete('/bookings/:id', adminController.deleteBooking);
router.patch('/bookings/:id/status', adminController.updateBookingStatus);

module.exports = router;
