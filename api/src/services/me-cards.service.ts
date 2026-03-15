import createError from 'http-errors';
import { prisma } from '../config/database';

export async function getUserCards(userId: number) {
  return prisma.userCard.findMany({
    where: { userId },
    include: {
      card: {
        include: {
          rateRules: {
            include: { category: true },
            orderBy: { mpd: 'desc' },
          },
        },
      },
    },
    orderBy: { addedAt: 'asc' },
  });
}

export async function addUserCard(userId: number, cardId: number, nickname?: string) {
  const card = await prisma.card.findFirst({ where: { id: cardId, isActive: true } });
  if (!card) throw createError(404, 'Card not found');

  const existing = await prisma.userCard.findUnique({ where: { userId_cardId: { userId, cardId } } });
  if (existing) throw createError(409, 'Card already in your wallet');

  return prisma.userCard.create({
    data: { userId, cardId, nickname },
    include: { card: true },
  });
}

export async function removeUserCard(userId: number, cardId: number) {
  const userCard = await prisma.userCard.findUnique({
    where: { userId_cardId: { userId, cardId } },
  });
  if (!userCard) throw createError(404, 'Card not in your wallet');

  await prisma.userCard.delete({ where: { userId_cardId: { userId, cardId } } });
}

export async function updateUserCard(userId: number, cardId: number, nickname: string | null) {
  const userCard = await prisma.userCard.findUnique({
    where: { userId_cardId: { userId, cardId } },
  });
  if (!userCard) throw createError(404, 'Card not in your wallet');

  return prisma.userCard.update({
    where: { userId_cardId: { userId, cardId } },
    data: { nickname },
    include: { card: true },
  });
}
