const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');

// Créer un hôtel (propriétaire)
router.post('/hotels', hotelController.createHotel);

module.exports = router;
