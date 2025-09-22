import { Router } from 'express';
import { login, logout, getMe } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth';
import { validateBody } from '../utils/validate';
import { loginSchema } from '../utils/validate';

const router = Router();

// POST /auth/login
router.post('/login', validateBody(loginSchema), login);

// POST /auth/logout
router.post('/logout', authenticateToken, logout);

// GET /auth/me
router.get('/me', authenticateToken, getMe);

export default router;
