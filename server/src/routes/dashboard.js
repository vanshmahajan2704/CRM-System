import express from 'express';
import {
  getDashboardData,
  getQuickStats,
  getLeadsAnalytics
} from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes protected
router.use(protect);

router.get('/', getDashboardData);
router.get('/quick-stats', getQuickStats);
router.get('/leads-analytics', getLeadsAnalytics);

export default router; // ✅ Changed from module.exports