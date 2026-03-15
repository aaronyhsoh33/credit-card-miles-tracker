import { PrismaClient } from '@prisma/client';
import { allCards } from './card-data';

export async function seedCards(prisma: PrismaClient) {
  console.log('Seeding cards...');

  for (const cardData of allCards) {
    const { rules, ...cardFields } = cardData;

    const card = await prisma.card.upsert({
      where: { slug: cardFields.slug },
      update: {
        name: cardFields.name,
        bank: cardFields.bank,
        network: cardFields.network,
        annualFee: cardFields.annualFee,
        baseRateMpd: cardFields.baseRateMpd,
        imagePath: cardFields.imagePath,
      },
      create: cardFields,
    });

    // Delete existing rules and recreate (simpler than diffing)
    await prisma.cardRateRule.deleteMany({ where: { cardId: card.id } });

    for (const rule of rules) {
      const category = await prisma.category.findUniqueOrThrow({
        where: { slug: rule.categorySlug },
      });

      await prisma.cardRateRule.create({
        data: {
          cardId: card.id,
          categoryId: category.id,
          mpd: rule.mpd,
          minSpend: rule.minSpend ?? null,
          monthlyCap: rule.monthlyCap ?? null,
          notes: rule.notes ?? null,
        },
      });
    }

    console.log(`  ✓ ${card.name}`);
  }

  console.log(`✓ ${allCards.length} cards seeded`);
}
