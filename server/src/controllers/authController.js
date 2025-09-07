import User from '../models/User.js';
import Activity from '../models/Activity.js';
import { generateToken, generateRefreshToken } from '../utils/token.js';
import jwt from 'jsonwebtoken';

// Register a new user (Admin only)
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: req.user.role === 'admin' ? role : 'agent' // Only admin can set role
    });

    // Log activity
    await Activity.create({
      action: 'User created',
      entityType: 'User',
      entityId: user._id,
      performedBy: req.user._id,
      details: { name: user.name, email: user.email, role: user.role }
    });

    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔍 Login attempt for:', email);

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email, isActive: true }).select('+password');
    console.log('🔍 Found user:', user);

    if (!user || !(await user.correctPassword(password, user.password))) {
      console.log('❌ Invalid credentials for:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    await Activity.create({
      action: 'User logged in',
      entityType: 'User',
      entityId: user._id,
      performedBy: user._id
    });

    user.password = undefined;

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Refresh token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret'
    );

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const newToken = generateToken(user._id);
    user.password = undefined;

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token: newToken
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(403).json({ message: 'Invalid refresh token' });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    await Activity.create({
      action: 'User logged out',
      entityType: 'User',
      entityId: req.user._id,
      performedBy: req.user._id
    });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get current user profile
const getMe = async (req, res) => {
  try {
    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email },
      { new: true, runValidators: true }
    );

    await Activity.create({
      action: 'Profile updated',
      entityType: 'User',
      entityId: user._id,
      performedBy: user._id,
      details: { name: user.name, email: user.email }
    });

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Default export
export default {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  updateProfile
};
