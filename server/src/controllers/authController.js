const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// POST /api/auth/register
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { username, email, password, firstName, lastName } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      return res.status(400).json({ success: false, message: `User with this ${field} already exists` });
    }

    const user = await User.create({
      username,
      email,
      password,
      profile: { firstName: firstName || '', lastName: lastName || '' },
    });

    const token = generateToken(user._id);
    return res.status(201).json({ success: true, token, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated. Contact support.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Update last active
    user.stats.lastActiveDate = new Date();
    await user.save();

    const token = generateToken(user._id);
    return res.status(200).json({ success: true, token, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/auth/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const allowedFields = ['profile'];
  const updates = {};

  if (req.body.profile) updates.profile = { ...req.user.profile.toObject(), ...req.body.profile };
  if (req.body.username) updates.username = req.body.username;

  try {
    const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true, runValidators: true });
    return res.status(200).json({ success: true, user });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Username already taken' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/auth/password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Please provide current and new password' });
  }
  try {
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    return res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getProfile, updateProfile, changePassword };
