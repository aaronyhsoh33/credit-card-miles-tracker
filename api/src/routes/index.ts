import { Router } from 'express';
import authRoutes from './auth.routes';
import cardsRoutes from './cards.routes';
import categoriesRoutes from './categories.routes';
import meRoutes from './me.routes';
import meCardsRoutes from './me-cards.routes';
import transactionsRoutes from './transactions.routes';
import recommendRoutes from './recommend.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/cards', cardsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/me', meRoutes);
router.use('/me/cards', meCardsRoutes);
router.use('/transactions', transactionsRoutes);
router.use('/recommend', recommendRoutes);

export default router;
