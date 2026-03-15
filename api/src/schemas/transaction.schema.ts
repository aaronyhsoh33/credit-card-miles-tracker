import { z } from 'zod';

export const createTransactionSchema = z.object({
  cardId: z.number().int().positive(),
  categoryId: z.number().int().positive(),
  amount: z.number().positive(),
  merchant: z.string().max(200).optional(),
  notes: z.string().max(500).optional(),
  transactedAt: z.string().datetime().or(z.string().date()),
});

export const updateTransactionSchema = z.object({
  cardId: z.number().int().positive().optional(),
  categoryId: z.number().int().positive().optional(),
  amount: z.number().positive().optional(),
  merchant: z.string().max(200).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
  transactedAt: z.string().datetime().or(z.string().date()).optional(),
});

export const listTransactionsSchema = z.object({
  from: z.string().date().optional(),
  to: z.string().date().optional(),
  cardId: z.coerce.number().int().positive().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const summaryQuerySchema = z.object({
  from: z.string().date().optional(),
  to: z.string().date().optional(),
});
