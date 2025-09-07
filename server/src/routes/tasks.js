import express from 'express';
import tasksController from '../controllers/tasksController.js';
import { protect } from '../middleware/auth.js';
import { checkOwnership, restrictTo, filterByOwnership } from '../middleware/roles.js';

const router = express.Router();

// All routes protected
router.use(protect);

// Get all tasks (admin sees all, agents see tasks assigned to them or where they are the agent)
router.route('/')
  .get(filterByOwnership('Task'), tasksController.getTasks)
  .post(restrictTo('admin', 'agent'), tasksController.createTask);

// Get current user's tasks (includes tasks where user is assigned or is the agent)
router.route('/my-tasks')
  .get(filterByOwnership('Task'), tasksController.getMyTasks);

// Get overdue tasks
router.route('/overdue')
  .get(filterByOwnership('Task'), tasksController.getOverdueTasks);

// Get task statistics
router.route('/stats')
  .get(filterByOwnership('Task'), tasksController.getTaskStats);

// Get related entity name for custom IDs
router.get('/related/:relatedTo/:relatedId', tasksController.getRelatedEntityName);

// Task operations with ownership check (agents can access tasks where they are assigned OR are the agent)
router.route('/:id')
  .get(checkOwnership('Task'), tasksController.getTask)
  .put(checkOwnership('Task'), tasksController.updateTask)
  .patch(checkOwnership('Task'), tasksController.updateTask) // For partial updates
  .delete(restrictTo('admin'), checkOwnership('Task'), tasksController.deleteTask);

// Update task status only (agents can update status of tasks assigned to them or where they are the agent)
router.patch('/:id/status', checkOwnership('Task'), tasksController.updateTaskStatus);

export default router;