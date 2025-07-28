const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { createBookingValidation } = require('../validations/bookingValidation');
const { validationResult } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation error', 
      errors: errors.array() 
    });
  }
  next();
};

router.get('/bookings/:id', authMiddleware, bookingController.getBookingById);
router.get('/bookings/:userId', authMiddleware, bookingController.getUserBookings);
router.post('/bookings', authMiddleware, createBookingValidation, handleValidation, bookingController.createBooking);

module.exports = router;
