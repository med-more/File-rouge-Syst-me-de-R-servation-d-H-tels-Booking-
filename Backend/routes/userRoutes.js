const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.patch('/profile', authMiddleware, userController.updateProfile);
router.get('/profile', authMiddleware, userController.getProfile);
router.delete('/profile', authMiddleware, userController.deleteAccount);

module.exports = router;
