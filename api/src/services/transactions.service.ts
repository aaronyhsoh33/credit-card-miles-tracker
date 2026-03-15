import createError from 'http-errors';
import { prisma } from '../config/database';
import { computeMiles } from './miles.service';

export async function createTransaction(
  userId: number,
  data: {
    cardId: number;
    categoryId: number;
    amount: number;
    merchant?: string;
    notes?: string;
    transactedAt: string;
  }
) {
  // Verify the card is in the user's wallet
  const userCard = await prisma.userCard.findUnique({
    where: { userId_cardId: { userId, cardId: data.cardId } },
    include: { card: true },
  });
  if (!userCard) throw createError(403, 'Card not in your wallet');

  const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
  if (!category) throw createError(404, 'Category not found');

  // Fetch rate rules for this card+category
  const rules = await prisma.cardRateRule.findMany({
    where: { cardId: data.cardId, categoryId: data.categoryId },
  });

  // Sum spend already this month for this card+category
  const transactedDate = new Date(data.transactedAt);
  const monthStart = new Date(transactedDate.getFullYear(), transactedDate.getMonth(), 1);
  const monthEnd = new Date(transactedDate.getFullYear(), transactedDate.getMonth() + 1, 1);

  const aggregate = await prisma.transaction.aggregate({
    where: {
      userId,
      cardId: data.cardId,
      categoryId: data.categoryId,
      transactedAt: { gte: monthStart, lt: monthEnd },
    },
    _sum: { amount: true },
  });

  const alreadySpent = Number(aggregate._sum.amount ?? 0);

  const { milesEarned } = computeMiles(
    rules,
    userCard.card.baseRateMpd,
    data.amount,
    alreadySpent
  );

  return prisma.transaction.create({
    data: {
      userId,
      cardId: data.cardId,
      categoryId: data.categoryId,
      amount: data.amount,
      merchant: data.merchant,
      notes: data.notes,
      transactedAt: new Date(data.transactedAt),
      milesEarned,
    },
    include: { card: true, category: true },
  });
}

export async function listTransactions(
  userId: number,
  filters: {
    from?: string;
    to?: string;
    cardId?: number;
    categoryId?: number;
    page: number;
    limit: number;
  }
) {
  const where = {
    userId,
    ...(filters.cardId ? { cardId: filters.cardId } : {}),
    ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
    ...(filters.from || filters.to
      ? {
          transactedAt: {
            ...(filters.from ? { gte: new Date(filters.from) } : {}),
            ...(filters.to ? { lte: new Date(filters.to + 'T23:59:59Z') } : {}),
          },
        }
      : {}),
  };

  const [total, items] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      include: { card: true, category: true },
      orderBy: { transactedAt: 'desc' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    }),
  ]);

  return { items, total, page: filters.page, limit: filters.limit };
}

export async function getTransaction(userId: number, id: number) {
  const tx = await prisma.transaction.findFirst({
    where: { id, userId },
    include: { card: true, category: true },
  });
  if (!tx) throw createError(404, 'Transaction not found');
  return tx;
}

export async function updateTransaction(
  userId: number,
  id: number,
  data: {
    cardId?: number;
    categoryId?: number;
    amount?: number;
    merchant?: string | null;
    notes?: string | null;
    transactedAt?: string;
  }
) {
  const existing = await prisma.transaction.findFirst({ where: { id, userId } });
  if (!existing) throw createError(404, 'Transaction not found');

  const cardId = data.cardId ?? existing.cardId;
  const categoryId = data.categoryId ?? existing.categoryId;
  const amount = data.amount ?? Number(existing.amount);
  const transactedAt = data.transactedAt ? new Date(data.transactedAt) : existing.transactedAt;

  // Recompute miles if relevant fields changed
  const userCard = await prisma.userCard.findUnique({
    where: { userId_cardId: { userId, cardId } },
    include: { card: true },
  });
  if (!userCard) throw createError(403, 'Card not in your wallet');

  const rules = await prisma.cardRateRule.findMany({ where: { cardId, categoryId } });
  const monthStart = new Date(transactedAt.getFullYear(), transactedAt.getMonth(), 1);
  const monthEnd = new Date(transactedAt.getFullYear(), transactedAt.getMonth() + 1, 1);

  const aggregate = await prisma.transaction.aggregate({
    where: {
      userId,
      cardId,
      categoryId,
      transactedAt: { gte: monthStart, lt: monthEnd },
      id: { not: id }, // exclude current tx
    },
    _sum: { amount: true },
  });

  const alreadySpent = Number(aggregate._sum.amount ?? 0);
  const { milesEarned } = computeMiles(rules, userCard.card.baseRateMpd, amount, alreadySpent);

  return prisma.transaction.update({
    where: { id },
    data: {
      ...(data.cardId ? { cardId: data.cardId } : {}),
      ...(data.categoryId ? { categoryId: data.categoryId } : {}),
      ...(data.amount !== undefined ? { amount: data.amount } : {}),
      ...(data.merchant !== undefined ? { merchant: data.merchant } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
      ...(data.transactedAt ? { transactedAt } : {}),
      milesEarned,
    },
    include: { card: true, category: true },
  });
}

export async function deleteTransaction(userId: number, id: number) {
  const existing = await prisma.transaction.findFirst({ where: { id, userId } });
  if (!existing) throw createError(404, 'Transaction not found');
  await prisma.transaction.delete({ where: { id } });
}

export async function getTransactionSummary(
  userId: number,
  filters: { from?: string; to?: string }
) {
  const where = {
    userId,
    ...(filters.from || filters.to
      ? {
          transactedAt: {
            ...(filters.from ? { gte: new Date(filters.from) } : {}),
            ...(filters.to ? { lte: new Date(filters.to + 'T23:59:59Z') } : {}),
          },
        }
      : {}),
  };

  const [totals, byCard, byCategory] = await Promise.all([
    prisma.transaction.aggregate({
      where,
      _sum: { amount: true, milesEarned: true },
      _count: true,
    }),
    prisma.transaction.groupBy({
      by: ['cardId'],
      where,
      _sum: { amount: true, milesEarned: true },
      _count: true,
    }),
    prisma.transaction.groupBy({
      by: ['categoryId'],
      where,
      _sum: { amount: true, milesEarned: true },
      _count: true,
    }),
  ]);

  return {
    totalSpend: Number(totals._sum.amount ?? 0),
    totalMiles: Number(totals._sum.milesEarned ?? 0),
    totalTransactions: totals._count,
    byCard,
    byCategory,
  };
}
