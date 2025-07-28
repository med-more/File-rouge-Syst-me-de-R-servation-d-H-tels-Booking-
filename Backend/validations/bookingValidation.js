const { body } = require('express-validator');

exports.createBookingValidation = [
  body('hotelId')
    .isMongoId()
    .withMessage('Hotel ID must be a valid MongoDB ID'),

  body('roomId')
    .isMongoId()
    .withMessage('Room ID must be a valid MongoDB ID'),

  body('checkIn')
    .isISO8601()
    .withMessage('Check-in date must be a valid date')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        throw new Error('Check-in date cannot be in the past');
      }
      return true;
    }),

  body('checkOut')
    .isISO8601()
    .withMessage('Check-out date must be a valid date')
    .custom((value, { req }) => {
      const checkOut = new Date(value);
      const checkIn = new Date(req.body.checkIn);
      if (checkOut <= checkIn) {
        throw new Error('Check-out date must be after check-in date');
      }
      return true;
    }),

  body('guests.adults')
    .isInt({ min: 1 })
    .withMessage('At least 1 adult is required'),

  body('guests.children')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Number of children must be a non-negative integer'),

  body('guests.infants')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Number of infants must be a non-negative integer'),

  body('guestDetails.primaryGuest.firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),

  body('guestDetails.primaryGuest.lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),

  body('guestDetails.primaryGuest.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Primary guest email must be a valid email address'),

  body('guestDetails.primaryGuest.phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Phone number must be a valid international format'),

  body('pricePerNight')
    .isFloat({ min: 0 })
    .withMessage('Price per night must be a positive number'),

  body('taxes')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Taxes must be a non-negative number'),

  body('fees')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Fees must be a non-negative number'),

  body('discount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount must be a non-negative number'),

  body('paymentMethod')
    .isIn(['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash'])
    .withMessage('Payment method must be one of: credit_card, debit_card, paypal, bank_transfer, cash'),

  body('specialRequests')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Special requests cannot exceed 1000 characters'),

  body('roomPreferences')
    .optional()
    .isArray()
    .withMessage('Room preferences must be an array'),

  body('roomPreferences.*')
    .optional()
    .isIn(['high_floor', 'low_floor', 'quiet_room', 'connecting_rooms', 'accessible_room', 'non_smoking'])
    .withMessage('Invalid room preference'),

  body('cancellationPolicy')
    .optional()
    .isIn(['free_cancellation', 'partial_refund', 'no_refund'])
    .withMessage('Cancellation policy must be one of: free_cancellation, partial_refund, no_refund'),

  body('source')
    .optional()
    .isIn(['website', 'mobile_app', 'phone', 'travel_agent', 'partner'])
    .withMessage('Source must be one of: website, mobile_app, phone, travel_agent, partner'),

  body('additionalGuests')
    .optional()
    .isArray()
    .withMessage('Additional guests must be an array'),

  body('additionalGuests.*.firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Additional guest first name must be between 2 and 50 characters'),

  body('additionalGuests.*.lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Additional guest last name must be between 2 and 50 characters'),

  body('additionalGuests.*.age')
    .optional()
    .isInt({ min: 0, max: 120 })
    .withMessage('Additional guest age must be between 0 and 120')
]; 