const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Toutes les routes admin nécessitent une authentification et des droits admin
router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard et statistiques
router.get('/dashboard', adminController.getDashboardStats);

module.exports = router;
