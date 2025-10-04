import { Router } from 'express';
import { getUser, updateUser } from '../controllers/users.controller';
import { authenticateToken } from '../middleware/auth';
import { requireSelfOrAdmin } from '../middleware/roles';
import { validateBody, validateParams } from '../utils/validate';
import { userUpdateSchema, registerSchema } from '../utils/validate';
import { register } from '../controllers/auth.controller';
import { z } from 'zod';

const router = Router();

const userIdSchema = z.object({
  id: z.string().min(1, 'ID пользователя обязателен')
});

router.post('/', validateBody(registerSchema), register);

router.get('/:id', authenticateToken, validateParams(userIdSchema), getUser);

router.patch(
  '/:id',
  authenticateToken,
  validateParams(userIdSchema),
  validateBody(userUpdateSchema),
  requireSelfOrAdmin,
  updateUser
);

export default router;