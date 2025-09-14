const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const rateLimit = require('express-rate-limit');
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
const authLimiter = rateLimit({ windowMs: 60 * 1000, max: 10 });
const emailActionLimiter = rateLimit({ windowMs: 60 * 1000, max: 3 });

router.post('/forgot-password', emailActionLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);
router.post('/verify-email', authLimiter, authController.verifyEmail);
router.post('/resend-verification', emailActionLimiter, authController.resendVerificationCode);
router.post('/change-password', authMiddleware, authController.changePassword);

// Route pour vérifier l'authentification de l'utilisateur

router.get('/me', authMiddleware, authController.getMe);

router.get('/test-auth', authMiddleware, (req, res) => {
  res.json({ 
    message: 'Auth working', 
    user: req.user,
    userId: req.user?.userId 
  });
});

module.exports = router;
