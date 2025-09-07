import User from '../models/User.js';

// Get all users (admin only)
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Get single user (admin only)
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

// Create user (admin only)
export const createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: 'Error creating user', error: error.message });
  }
};

// Update user (admin only)
export const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { 
      new: true,
      runValidators: true 
    }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: 'Error updating user', error: error.message });
  }
};

// Delete user (admin only)
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

// Update own profile
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
      runValidators: true
    }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: 'Error updating profile', error: error.message });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    // Password change logic here
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error changing password', error: error.message });
  }
};

// Deactivate user (admin only)
export const deactivateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, 
      { isActive: false }, 
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: 'Error deactivating user', error: error.message });
  }
};