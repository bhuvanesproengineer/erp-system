import { Router } from 'express';
import * as productController from '../controllers/productController';
import { verifyJWT } from '../middleware/verifyJWT';
import { authorizeRole } from '../middleware/authorizeRole';

const router = Router();

// Protect all product routes with JWT authentication
router.use(verifyJWT);

// Specific GET routes MUST come before parameter route /:id
router.get('/search', authorizeRole('Admin', 'Warehouse', 'Sales', 'Accounts'), productController.searchProducts);
router.get('/low-stock', authorizeRole('Admin', 'Warehouse', 'Accounts'), productController.getLowStockProducts);

// Product CRUD routes
router.post('/', authorizeRole('Admin'), productController.createProduct);
router.get('/', authorizeRole('Admin', 'Warehouse', 'Sales', 'Accounts'), productController.getAllProducts);
router.get('/:id', authorizeRole('Admin', 'Warehouse', 'Sales', 'Accounts'), productController.getProductById);
router.put('/:id', authorizeRole('Admin'), productController.updateProduct);
router.delete('/:id', authorizeRole('Admin'), productController.deleteProduct);

// Inventory & Movement routes
router.post('/:id/stock', authorizeRole('Admin', 'Warehouse'), productController.addStockMovement);
router.get('/:id/movements', authorizeRole('Admin', 'Warehouse', 'Accounts'), productController.getStockMovements);

export default router;
