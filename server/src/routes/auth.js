import express from 'express';
import authController from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { restrictTo } from '../middleware/roles.js';

const router = express.Router();

// Public routes
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);

// Protected routes
router.use(protect); // All routes below are protected

router.post('/logout', authController.logout);
router.get('/me', authController.getMe);
router.put('/profile', authController.updateProfile);
router.post('/register', restrictTo('admin'), authController.register); // Only admin can register users

export default router;