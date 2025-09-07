import express from 'express';
import agentsController from '../controllers/agentsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/', agentsController.getAgents);

export default router;