import { prisma } from '../config/database';
import { computeMiles } from './miles.service';

export type RecommendResult = {
  cardId: number;
  cardName: string;
  bank: string;
  network: string;
  nickname: string | null;
  bestMpd: number;
  milesEarned: number | null;
  effectiveRate: number;
  cappedWarning: boolean;
  capsExhausted: boolean;
  minSpendUnmet: boolean;
};

export async function recommendCards(
  userId: number,
  categorySlug: string,
  amount?: number
): Promise<RecommendResult[]> {
  const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
  if (!category) return [];

  const userCards = await prisma.userCard.findMany({
    where: { userId },
    include: {
      card: {
        include: {
          rateRules: {
            where: { categoryId: category.id },
          },
        },
      },
    },
  });

  if (userCards.length === 0) return [];

  // Get current month spend per card+category for this user
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const spendAggregates = await prisma.transaction.groupBy({
    by: ['cardId'],
    where: {
      userId,
      categoryId: category.id,
      transactedAt: { gte: monthStart, lt: monthEnd },
    },
    _sum: { amount: true },
  });

  const spendByCard = new Map(
    spendAggregates.map((a) => [a.cardId, Number(a._sum.amount ?? 0)])
  );

  const results: RecommendResult[] = userCards.map(({ card, nickname }) => {
    const rules = card.rateRules;
    const alreadySpent = spendByCard.get(card.id) ?? 0;
    const txAmount = amount ?? 100; // use $100 as default for ranking when no amount given

    const result = computeMiles(rules, card.baseRateMpd, txAmount, alreadySpent);
    const bestMpd = rules.length > 0
      ? Math.max(...rules.map((r) => Number(r.mpd)))
      : Number(card.baseRateMpd);

    return {
      cardId: card.id,
      cardName: card.name,
      bank: card.bank,
      network: card.network,
      nickname,
      bestMpd,
      milesEarned: amount != null ? result.milesEarned : null,
      effectiveRate: result.effectiveRate,
      cappedWarning: result.cappedWarning,
      capsExhausted: result.capsExhausted,
      minSpendUnmet: result.minSpendUnmet,
    };
  });

  // Sort by miles earned (or effective rate if no amount given), then by best mpd, then name
  return results.sort((a, b) => {
    const aScore = a.milesEarned ?? a.effectiveRate;
    const bScore = b.milesEarned ?? b.effectiveRate;
    if (bScore !== aScore) return bScore - aScore;
    if (b.bestMpd !== a.bestMpd) return b.bestMpd - a.bestMpd;
    return a.cardName.localeCompare(b.cardName);
  });
}

export async function recommendAllCategories(userId: number) {
  const categories = await prisma.category.findMany({ orderBy: { label: 'asc' } });
  const results = await Promise.all(
    categories.map(async (cat) => ({
      category: cat,
      bestCard: (await recommendCards(userId, cat.slug))[0] ?? null,
    }))
  );
  return results;
}
