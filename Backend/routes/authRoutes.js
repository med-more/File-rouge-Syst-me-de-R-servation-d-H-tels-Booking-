const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { registerValidation, loginValidation } = require('../validations/authValidation');
const { validationResult } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ 
      message: 'Erreurs de validation',
      errors: errors.array() 
    });
  }
  next();
};

router.post('/register', registerValidation, handleValidation, authController.register);
router.post('/login', loginValidation, handleValidation, authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerificationCode);

// Route pour vérifier l'authentification de l'utilisateur
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
