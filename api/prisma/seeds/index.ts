import { PrismaClient } from '@prisma/client';
import { seedCategories } from './categories.seed';
import { seedCards } from './cards.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');
  await seedCategories(prisma);
  await seedCards(prisma);
  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
