const User = require('../models/User');

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email, countryCode, phone } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = email;
    }
    if (name) user.name = name;
    if (countryCode) user.countryCode = countryCode;
    if (phone) user.phone = phone;
    await user.save();
    const { password, ...userData } = user.toObject();
    res.json({ user: userData });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await require('../models/User').findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { password, ...userData } = user.toObject();
    res.json({ user: userData });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
