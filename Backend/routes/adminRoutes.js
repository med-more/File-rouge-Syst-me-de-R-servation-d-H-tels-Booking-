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
router.get('/test-data', adminController.testData);

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

// Gestion des utilisateurs
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id/role', adminController.updateUserRole);
router.put('/users/:id/status', adminController.updateUserStatus);
router.delete('/users/:id', adminController.deleteUser);
router.post('/users/bulk-action', adminController.bulkUserAction);
router.get('/users/export', adminController.exportUsers);

module.exports = router;
