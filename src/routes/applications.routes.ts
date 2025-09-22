import { Router } from 'express';
import { 
  createApplication, 
  getProjectApplications, 
  updateApplicationStatus,
  getUserApplications
} from '../controllers/applications.controller';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { validateBody, validateParams } from '../utils/validate';
import { 
  applicationCreateSchema, 
  applicationStatusUpdateSchema
} from '../utils/validate';
import { z } from 'zod';

const router = Router();

const applicationIdSchema = z.object({
  id: z.string().min(1, 'ID заявки обязателен')
});

const projectIdSchema = z.object({
  id: z.string().min(1, 'ID проекта обязателен')
});

// POST /applications
router.post(
  '/',
  optionalAuth,
  validateBody(applicationCreateSchema),
  createApplication
);

// GET /projects/:id/applications
router.get(
  '/projects/:id',
  authenticateToken,
  validateParams(projectIdSchema),
  requireRole(['admin']), // Только админы или владельцы проекта (проверка в контроллере)
  getProjectApplications
);

// PATCH /applications/:id
router.patch(
  '/:id',
  authenticateToken,
  validateParams(applicationIdSchema),
  validateBody(applicationStatusUpdateSchema),
  updateApplicationStatus
);

// GET /applications (заявки пользователя)
router.get(
  '/',
  authenticateToken,
  getUserApplications
);

export default router;
