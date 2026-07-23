import { Router } from 'express';
import * as challanController from '../controllers/challanController';
import { verifyJWT } from '../middleware/verifyJWT';
import { authorizeRole } from '../middleware/authorizeRole';

const router = Router();

router.use(verifyJWT);

// Specific GET routes before /:id
router.get('/search', authorizeRole('Admin', 'Sales', 'Accounts', 'Warehouse'), challanController.searchChallans);

// Challan operations
router.get('/', authorizeRole('Admin', 'Sales', 'Accounts', 'Warehouse'), challanController.getAllChallans);
router.get('/:id', authorizeRole('Admin', 'Sales', 'Accounts', 'Warehouse'), challanController.getChallanById);
router.post('/', authorizeRole('Admin', 'Sales'), challanController.createChallan);
router.put('/:id/confirm', authorizeRole('Admin', 'Sales', 'Warehouse'), challanController.confirmChallan);
router.put('/:id/cancel', authorizeRole('Admin', 'Sales'), challanController.cancelChallan);

export default router;
