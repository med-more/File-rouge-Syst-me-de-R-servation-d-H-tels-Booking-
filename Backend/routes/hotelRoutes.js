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
router.get('/hotels/:id', hotelController.getHotelById);
router.put('/hotels/:id', createHotelValidation, handleValidation, hotelController.updateHotel);

module.exports = router;
