import { Router } from 'express';
import { 
  getProjects, 
  getProjectsByOwner,
  getProject, 
  createProject, 
  updateProject, 
  deleteProject,
  addTeamMember,
  removeTeamMember
} from '../controllers/projects.controller';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { requireProjectOwnership, requireProjectCreationRole } from '../middleware/roles';
import { validateBody, validateQuery, validateParams } from '../utils/validate';
import { 
  projectCreateSchema, 
  projectUpdateSchema, 
  projectFiltersSchema,
  teamMemberSchema
} from '../utils/validate';
import { z } from 'zod';

const router = Router();

const projectIdSchema = z.object({
  id: z.string().min(1, 'ID проекта обязателен')
});

const teamMemberParamsSchema = z.object({
  id: z.string().min(1, 'ID проекта обязателен'),
  userId: z.string().min(1, 'ID пользователя обязателен')
});

const ownerIdSchema = z.object({
  ownerId: z.string().min(1, 'ID владельца обязателен')
});

router.get('/', optionalAuth, validateQuery(projectFiltersSchema), getProjects);

router.get('/owner/:ownerId', optionalAuth, validateParams(ownerIdSchema), getProjectsByOwner);

router.get('/:id', optionalAuth, validateParams(projectIdSchema), getProject);

router.post(
  '/',
  authenticateToken,
  validateBody(projectCreateSchema),
  requireProjectCreationRole,
  createProject
);

router.patch(
  '/:id',
  authenticateToken,
  validateParams(projectIdSchema),
  validateBody(projectUpdateSchema),
  requireProjectOwnership,
  updateProject
);

router.delete(
  '/:id',
  authenticateToken,
  validateParams(projectIdSchema),
  requireProjectOwnership,
  deleteProject
);

router.post(
  '/:id/team',
  authenticateToken,
  validateParams(projectIdSchema),
  validateBody(teamMemberSchema),
  requireProjectOwnership,
  addTeamMember
);

router.delete(
  '/:id/team/:userId',
  authenticateToken,
  validateParams(teamMemberParamsSchema),
  requireProjectOwnership,
  removeTeamMember
);

export default router;
