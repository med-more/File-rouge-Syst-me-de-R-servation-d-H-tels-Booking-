const { body } = require('express-validator');

exports.createHotelValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('pricePerNight').isFloat({ min: 1 }).withMessage('Price per night must be at least 1'),
  body('rating').isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('amenities').isArray({ min: 1 }).withMessage('At least one amenity is required'),
  body('images').optional().isArray(),
  body('rooms').isArray().withMessage('Rooms must be an array'),
  body('rooms.*.type').notEmpty().withMessage('Room type is required'),
  body('rooms.*.pricePerNight').isFloat({ min: 1 }).withMessage('Room price must be at least 1'),
  body('rooms.*.maxGuests').isInt({ min: 1 }).withMessage('Max guests must be at least 1'),
  body('rooms.*.quantity').isInt({ min: 1 }).withMessage('Room quantity must be at least 1'),
]; 