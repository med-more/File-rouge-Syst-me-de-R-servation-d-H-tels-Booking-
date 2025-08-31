const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');
const { createHotelValidation } = require('../validations/hotelValidation');
const { validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post('/hotels', createHotelValidation, handleValidation, hotelController.createHotel);
router.get('/hotels', hotelController.getHotels);
router.get('/hotels/featured', hotelController.getFeaturedHotels);
router.get('/stats', hotelController.getStats);
router.get('/destinations/popular', hotelController.getPopularDestinations);
router.get('/hotels/:id', hotelController.getHotelById);
router.put('/hotels/:id', createHotelValidation, handleValidation, hotelController.updateHotel);
router.delete('/hotels/:id', hotelController.deleteHotel);
router.get('/hotels/search', hotelController.searchHotels);
router.get('/hotels/:id/rooms', hotelController.getHotelRooms);
router.get('/hotels/:id/availability', hotelController.getHotelAvailability);

module.exports = router;
