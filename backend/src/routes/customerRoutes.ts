import { Router } from 'express';
import * as customerController from '../controllers/customerController';
import { verifyJWT } from '../middleware/verifyJWT';
import { authorizeRole } from '../middleware/authorizeRole';

const router = Router();

router.use(verifyJWT);

// Specific GET routes before parametric route /:id
router.get('/search', authorizeRole('Admin', 'Sales', 'Accounts', 'Warehouse'), customerController.searchCustomers);

// CRUD & Details
router.get('/', authorizeRole('Admin', 'Sales', 'Accounts', 'Warehouse'), customerController.getAllCustomers);
router.get('/:id/details', authorizeRole('Admin', 'Sales', 'Accounts'), customerController.getCustomerDetails);
router.get('/:id', authorizeRole('Admin', 'Sales', 'Accounts'), customerController.getCustomerById);
router.post('/', authorizeRole('Admin', 'Sales'), customerController.createCustomer);
router.put('/:id', authorizeRole('Admin', 'Sales'), customerController.updateCustomer);
router.delete('/:id', authorizeRole('Admin', 'Sales'), customerController.deleteCustomer);

// Follow-up notes
router.post('/:id/followups', authorizeRole('Admin', 'Sales'), customerController.addFollowup);

export default router;
