import express from 'express';
import {
  getActivityLogs,
  getRecentActivity,
  logActivity,
  getEntityActivity
} from '../controllers/activityController.js';
import { protect } from '../middleware/auth.js';
import { restrictTo } from '../middleware/roles.js';

const router = express.Router();

// All routes protected
router.use(protect);

router.get('/', getActivityLogs);
router.get('/recent', getRecentActivity);
router.get('/:entityType/:entityId', getEntityActivity);

// Only admins can manually log activities
router.post('/', restrictTo('admin'), logActivity);

// Use default export
export default router;