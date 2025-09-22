import { Router } from 'express';
import { getRoles, getTechnologies, getCategories } from '../controllers/dictionaries.controller';

const router = Router();

// GET /roles
router.get('/roles', getRoles);

// GET /technologies
router.get('/technologies', getTechnologies);

// GET /categories
router.get('/categories', getCategories);

export default router;
