import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController';
import { verifyJWT } from '../middleware/verifyJWT';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyJWT, getMe);

export default router;
