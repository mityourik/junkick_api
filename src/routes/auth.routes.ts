import { Router } from 'express';
import { login, logout, getMe, register } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth';
import { validateBody } from '../utils/validate';
import { loginSchema, registerSchema } from '../utils/validate';

const router = Router();

router.post('/register', validateBody(registerSchema), register);

router.post('/login', validateBody(loginSchema), login);

router.post('/logout', authenticateToken, logout);

router.get('/me', authenticateToken, getMe);

export default router;