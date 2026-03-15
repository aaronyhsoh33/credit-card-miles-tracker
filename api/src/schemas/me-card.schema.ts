import { z } from 'zod';

export const addUserCardSchema = z.object({
  cardId: z.number().int().positive(),
  nickname: z.string().max(100).optional(),
});

export const updateUserCardSchema = z.object({
  nickname: z.string().max(100).nullable(),
});

export const recommendQuerySchema = z.object({
  category: z.string().min(1),
  amount: z.coerce.number().positive().optional(),
});
