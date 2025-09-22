import { Router } from 'express';
import { 
  getProjects, 
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

// GET /projects
router.get('/', optionalAuth, validateQuery(projectFiltersSchema), getProjects);

// GET /projects/:id
router.get('/:id', optionalAuth, validateParams(projectIdSchema), getProject);

// POST /projects
router.post(
  '/',
  authenticateToken,
  validateBody(projectCreateSchema),
  requireProjectCreationRole,
  createProject
);

// PATCH /projects/:id
router.patch(
  '/:id',
  authenticateToken,
  validateParams(projectIdSchema),
  validateBody(projectUpdateSchema),
  requireProjectOwnership,
  updateProject
);

// DELETE /projects/:id
router.delete(
  '/:id',
  authenticateToken,
  validateParams(projectIdSchema),
  requireProjectOwnership,
  deleteProject
);

// POST /projects/:id/team
router.post(
  '/:id/team',
  authenticateToken,
  validateParams(projectIdSchema),
  validateBody(teamMemberSchema),
  requireProjectOwnership,
  addTeamMember
);

// DELETE /projects/:id/team/:userId
router.delete(
  '/:id/team/:userId',
  authenticateToken,
  validateParams(teamMemberParamsSchema),
  requireProjectOwnership,
  removeTeamMember
);

export default router;
