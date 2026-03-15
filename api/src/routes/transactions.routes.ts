import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createTransactionSchema,
  updateTransactionSchema,
  listTransactionsSchema,
  summaryQuerySchema,
} from '../schemas/transaction.schema';
import * as txController from '../controllers/transactions.controller';

const router = Router();

router.use(requireAuth);

router.get('/summary', validate(summaryQuerySchema, 'query'), txController.getTransactionSummary);
router.get('/', validate(listTransactionsSchema, 'query'), txController.listTransactions);
router.post('/', validate(createTransactionSchema), txController.createTransaction);
router.get('/:id', txController.getTransaction);
router.patch('/:id', validate(updateTransactionSchema), txController.updateTransaction);
router.delete('/:id', txController.deleteTransaction);

export default router;
