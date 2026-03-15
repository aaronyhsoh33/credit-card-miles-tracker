import { prisma } from '../config/database';

export async function listCards(filters: { bank?: string; categorySlug?: string }) {
  const cards = await prisma.card.findMany({
    where: {
      isActive: true,
      ...(filters.bank ? { bank: { equals: filters.bank, mode: 'insensitive' } } : {}),
      ...(filters.categorySlug
        ? {
            rateRules: {
              some: { category: { slug: filters.categorySlug } },
            },
          }
        : {}),
    },
    include: {
      rateRules: {
        include: { category: true },
        orderBy: { mpd: 'desc' },
      },
    },
    orderBy: [{ bank: 'asc' }, { name: 'asc' }],
  });
  return cards;
}

export async function getCard(id: number) {
  return prisma.card.findFirst({
    where: { id, isActive: true },
    include: {
      rateRules: {
        include: { category: true },
        orderBy: { mpd: 'desc' },
      },
    },
  });
}
