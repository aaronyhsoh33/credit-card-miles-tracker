import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { recommendQuerySchema } from '../schemas/me-card.schema';
import * as recommendController from '../controllers/recommend.controller';

const router = Router();

router.use(requireAuth);

router.get('/all', recommendController.recommendAll);
router.get('/', validate(recommendQuerySchema, 'query'), recommendController.recommend);

export default router;
