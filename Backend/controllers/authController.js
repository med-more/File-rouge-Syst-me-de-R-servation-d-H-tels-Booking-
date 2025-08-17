const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

exports.register = async (req, res) => {
  try {
    console.log('Registration request body:', req.body);
    const { name, email, countryCode, phone, password } = req.body;
    
    // Validation des champs requis
    if (!name || !email || !countryCode || !phone || !password) {
      console.log('Missing required fields:', { name: !!name, email: !!email, countryCode: !!countryCode, phone: !!phone, password: !!password });
      return res.status(400).json({ 
        message: 'Tous les champs sont requis',
        missing: {
          name: !name,
          email: !email,
          countryCode: !countryCode,
          phone: !phone,
          password: !password
        }
      });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    // Générer un code de vérification à 6 chiffres
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      countryCode,
      phone,
      password: hashedPassword,
      emailVerificationCode: verificationCode,
      emailVerificationExpires: verificationExpires,
      isEmailVerified: false,
    });

    // Vérifier la configuration email
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email configuration missing. Please set EMAIL_USER and EMAIL_PASS in .env');
      // On continue sans envoyer l'email, l'utilisateur peut demander un nouveau code
    } else {
      // Envoyer l'email de vérification
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Vérification de votre compte HotelBook',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1f2937; text-align: center;">Bienvenue sur HotelBook !</h2>
            <p style="color: #4b5563; font-size: 16px;">Bonjour ${user.name},</p>
            <p style="color: #4b5563; font-size: 16px;">Merci de vous être inscrit sur HotelBook. Pour activer votre compte, veuillez entrer le code de vérification suivant :</p>
            <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
              <h1 style="color: white; font-size: 32px; letter-spacing: 8px; margin: 0;">${verificationCode}</h1>
            </div>
            <p style="color: #4b5563; font-size: 14px;">Ce code expirera dans 10 minutes.</p>
            <p style="color: #4b5563; font-size: 14px;">Si vous n'avez pas créé de compte, ignorez cet email.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 12px; text-align: center;">© 2024 HotelBook. Tous droits réservés.</p>
          </div>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully to:', user.email);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // On continue même si l'email échoue, l'utilisateur peut demander un nouveau code
      }
    }

    res.status(201).json({ 
      message: 'Inscription réussie ! Veuillez vérifier votre email.',
      userId: user._id,
      email: user.email
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Mettre à jour lastLoginAt
    user.lastLoginAt = new Date();
    await user.save();
    
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address
      } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.logout = (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No user with this email' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = Date.now() + 1000 * 60 * 60; 
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();

    console.log('RESET TOKEN (for test):', resetToken);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset',
      html: `<p>You requested a password reset.</p><p>Click <a href="${resetUrl}">here</a> to reset your password. This link is valid for 1 hour.</p>`,
    };
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      emailVerificationCode: code,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Code de vérification invalide ou expiré' });
    }

    // Marquer l'email comme vérifié
    user.isEmailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Générer un token JWT pour connecter automatiquement l'utilisateur
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ 
      message: 'Email vérifié avec succès !',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: true
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email déjà vérifié' });
    }

    // Générer un nouveau code de vérification
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.emailVerificationCode = verificationCode;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    // Envoyer le nouvel email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Nouveau code de vérification - HotelBook',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937; text-align: center;">Nouveau code de vérification</h2>
          <p style="color: #4b5563; font-size: 16px;">Bonjour ${user.name},</p>
          <p style="color: #4b5563; font-size: 16px;">Voici votre nouveau code de vérification :</p>
          <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
            <h1 style="color: white; font-size: 32px; letter-spacing: 8px; margin: 0;">${verificationCode}</h1>
          </div>
          <p style="color: #4b5563; font-size: 14px;">Ce code expirera dans 10 minutes.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px; text-align: center;">© 2024 HotelBook. Tous droits réservés.</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Resend verification email sent successfully to:', user.email);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return res.status(500).json({ message: 'Échec de l\'envoi de l\'email' });
    }

    res.json({ message: 'Nouveau code de vérification envoyé' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Vérifier l'authentification de l'utilisateur
exports.getMe = async (req, res) => {
  try {
    // L'utilisateur est déjà vérifié par le middleware d'authentification
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({ 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};