import express from 'express';
import leadsController from '../controllers/leadsController.js';
import { protect } from '../middleware/auth.js';
import { checkOwnership, restrictTo } from '../middleware/roles.js';

const router = express.Router();

// All routes protected
router.use(protect);

router.route('/')
  .get(leadsController.getLeads)
  .post(leadsController.createLead);

router.route('/:id')
  .get(checkOwnership('Lead'), leadsController.getLead)
  .put(checkOwnership('Lead'), leadsController.updateLead)
  .patch(checkOwnership('Lead'), leadsController.updateLead) // Use the same method
  .delete(restrictTo('admin'), leadsController.deleteLead);

router.post('/:id/convert', checkOwnership('Lead'), leadsController.convertLeadToCustomer);
router.get('/stats/status', leadsController.getLeadStats);
router.get('/stats/source', leadsController.getLeadsBySource);

export default router;