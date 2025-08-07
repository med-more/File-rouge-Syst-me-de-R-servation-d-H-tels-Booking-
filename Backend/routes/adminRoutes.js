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

module.exports = router;
