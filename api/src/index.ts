import 'dotenv/config';
import { createApp } from './server';
import { env } from './config/env';
import { prisma } from './config/database';

async function main() {
  const app = createApp();

  await prisma.$connect();
  console.log('Connected to database');

  app.listen(env.PORT, () => {
    console.log(`API server running on http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
