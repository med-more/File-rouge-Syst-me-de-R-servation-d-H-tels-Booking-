const { body } = require('express-validator');

exports.createRoomValidation = [
  body('hotelId')
    .notEmpty()
    .withMessage('Hotel ID is required')
    .isMongoId()
    .withMessage('Invalid hotel ID format'),
  
  body('type')
    .notEmpty()
    .withMessage('Room type is required')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Room type must be between 2 and 50 characters'),
  
  body('description')
    .notEmpty()
    .withMessage('Room description is required')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  
  body('pricePerNight')
    .notEmpty()
    .withMessage('Price per night is required')
    .isFloat({ min: 1 })
    .withMessage('Price must be a positive number'),
  
  body('maxGuests')
    .notEmpty()
    .withMessage('Max guests is required')
    .isInt({ min: 1, max: 10 })
    .withMessage('Max guests must be between 1 and 10'),
  
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  
  body('amenities')
    .optional()
    .isArray()
    .withMessage('Amenities must be an array'),
  
  body('amenities.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each amenity must be between 1 and 50 characters'),
  
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  
  body('images.*')
    .optional()
    .isURL()
    .withMessage('Each image must be a valid URL'),
  
  body('status')
    .optional()
    .isIn(['available', 'occupied', 'maintenance', 'reserved'])
    .withMessage('Invalid status value'),
  
  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean')
]; 