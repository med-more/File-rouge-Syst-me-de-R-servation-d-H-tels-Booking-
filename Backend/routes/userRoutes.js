const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.patch('/profile', authMiddleware, userController.updateProfile);

module.exports = router;
