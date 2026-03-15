import { Router } from 'express';
import * as cardsController from '../controllers/cards.controller';

const router = Router();

router.get('/', cardsController.listCards);
router.get('/:id', cardsController.getCard);

export default router;
