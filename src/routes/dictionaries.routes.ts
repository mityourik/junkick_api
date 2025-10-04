import { Router } from 'express';
import { getRoles, getTechnologies, getCategories } from '../controllers/dictionaries.controller';

const router = Router();

router.get('/roles', getRoles);

router.get('/technologies', getTechnologies);

router.get('/categories', getCategories);

export default router;
