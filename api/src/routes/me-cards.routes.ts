import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { addUserCardSchema, updateUserCardSchema } from '../schemas/me-card.schema';
import * as meCardsController from '../controllers/me-cards.controller';

const router = Router();

router.use(requireAuth);

router.get('/', meCardsController.getUserCards);
router.post('/', validate(addUserCardSchema), meCardsController.addUserCard);
router.delete('/:cardId', meCardsController.removeUserCard);
router.patch('/:cardId', validate(updateUserCardSchema), meCardsController.updateUserCard);

export default router;
