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

router.post('/bookings/check-availability', authMiddleware, bookingController.checkAvailability);
router.get('/bookings/hotel/:hotelId', authMiddleware, bookingController.getHotelBookings);
router.get('/bookings/user/:userId', authMiddleware, bookingController.getUserBookings);
// Route de test temporaire
router.get('/bookings/debug/all', bookingController.debugAllBookings);
router.get('/bookings/:id', authMiddleware, bookingController.getBookingById);
router.post('/bookings', authMiddleware, createBookingValidation, handleValidation, bookingController.createBooking);
router.post('/bookings/:id/confirm', authMiddleware, bookingController.confirmBooking);
router.put('/bookings/:id', authMiddleware, bookingController.updateBooking);
router.delete('/bookings/:id', authMiddleware, bookingController.deleteBooking);
// Route pour annuler une réservation (pour les utilisateurs)
router.patch('/bookings/:id/cancel', authMiddleware, bookingController.cancelBooking);

module.exports = router;
