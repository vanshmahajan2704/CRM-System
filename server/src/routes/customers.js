import express from 'express';
import customersController from '../controllers/customersController.js';
import { protect } from '../middleware/auth.js';
import { checkOwnership, filterByOwnership } from '../middleware/roles.js';

const router = express.Router();

// All routes protected
router.use(protect);

router.route('/')
  .get(filterByOwnership('Customer'), customersController.getCustomers)
  .post(customersController.createCustomer);

router.route('/:id')
  .get(checkOwnership('Customer'), customersController.getCustomer)
  .put(checkOwnership('Customer'), customersController.updateCustomer)     // PUT
  .patch(checkOwnership('Customer'), customersController.updateCustomer)   // ← ADD THIS LINE
  .delete(checkOwnership('Customer'), customersController.deleteCustomer);

router.route('/:id/notes')
  .get(checkOwnership('Customer'), customersController.getNotes)
  .post(checkOwnership('Customer'), customersController.addNote);

export default router;