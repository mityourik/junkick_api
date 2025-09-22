import { Router } from 'express';
import { getUser, updateUser } from '../controllers/users.controller';
import { authenticateToken } from '../middleware/auth';
import { requireSelfOrAdmin } from '../middleware/roles';
import { validateBody, validateParams } from '../utils/validate';
import { userUpdateSchema } from '../utils/validate';
import { z } from 'zod';

const router = Router();

const userIdSchema = z.object({
  id: z.string().min(1, 'ID пользователя обязателен')
});

// GET /users/:id
router.get('/:id', authenticateToken, validateParams(userIdSchema), getUser);

// PATCH /users/:id
router.patch(
  '/:id',
  authenticateToken,
  validateParams(userIdSchema),
  validateBody(userUpdateSchema),
  requireSelfOrAdmin,
  updateUser
);

export default router;
