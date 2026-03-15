import { PrismaClient } from '@prisma/client';

const categories = [
  { slug: 'dining', label: 'Dining', icon: 'silverware-fork-knife' },
  { slug: 'online', label: 'Online Shopping', icon: 'cart-outline' },
  { slug: 'groceries', label: 'Groceries', icon: 'basket-outline' },
  { slug: 'travel', label: 'Travel', icon: 'airplane' },
  { slug: 'petrol', label: 'Petrol', icon: 'gas-station' },
  { slug: 'entertainment', label: 'Entertainment', icon: 'movie-open-outline' },
  { slug: 'transport', label: 'Transport', icon: 'bus' },
  { slug: 'shopping', label: 'Shopping', icon: 'shopping-outline' },
  { slug: 'general', label: 'General', icon: 'credit-card-outline' },
];

export async function seedCategories(prisma: PrismaClient) {
  console.log('Seeding categories...');
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { label: cat.label, icon: cat.icon },
      create: cat,
    });
  }
  console.log(`✓ ${categories.length} categories seeded`);
}
