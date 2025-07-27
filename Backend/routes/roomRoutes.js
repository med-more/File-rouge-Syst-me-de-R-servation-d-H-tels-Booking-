const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { createRoomValidation } = require('../validations/roomValidation');
const { validationResult } = require('express-validator');

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

router.get('/rooms', roomController.getRooms);
router.get('/rooms/:id', roomController.getRoomById);
router.post('/rooms', createRoomValidation, handleValidation, roomController.createRoom);

module.exports = router; 