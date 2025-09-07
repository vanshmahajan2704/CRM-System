import express from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateProfile,
  changePassword,
  deactivateUser
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { restrictTo, canManageUsers } from '../middleware/roles.js';

const router = express.Router();

// All routes protected
router.use(protect);

// Admin only routes
router.get('/', restrictTo('admin'), getUsers);
router.post('/', restrictTo('admin'), createUser);
router.get('/:id', restrictTo('admin'), getUser);
router.put('/:id', restrictTo('admin'), updateUser);
router.delete('/:id', restrictTo('admin'), deleteUser);
router.patch('/:id/deactivate', restrictTo('admin'), deactivateUser);

// User profile routes (accessible by own user)
router.put('/profile/update', updateProfile);
router.put('/profile/change-password', changePassword);

export default router;