import { parseArgs } from 'node:util';

import { PrismaClient } from '@src/generated/prisma/client.js';
import type { PrismaClient as PrismaClientType } from '@src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

import { seedPosts } from './data/posts.seeder.js';
import { seedUsers } from './data/users.seeder.js';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});

const prisma = new PrismaClient({ adapter });

const options = {
  environment: { type: 'string' as const },
};

/**
 * Development seeders - runs all seeders in order
 */
async function seedDevelopment(prisma: PrismaClientType): Promise<void> {
  console.log('🌱 Seeding development data...\n');

  // Order matters! Users must be seeded before posts
  await seedUsers(prisma);
  await seedPosts(prisma);

  // Add more seeders here as needed:
  // await seedCategories(prisma);
  // await seedComments(prisma);
  // etc.

  console.log('\n✅ Development data seeded successfully!');
}

/**
 * Test seeders - minimal data for testing
 */
async function seedTest(prisma: PrismaClientType): Promise<void> {
  console.log('🧪 Seeding test data...\n');

  // Add minimal test data here
  await seedUsers(prisma);

  console.log('\n✅ Test data seeded successfully!');
}

async function main(): Promise<void> {
  const {
    values: { environment },
  } = parseArgs({ options });

  switch (environment) {
    case 'development':
      await seedDevelopment(prisma);
      break;
    case 'test':
      await seedTest(prisma);
      break;
    case 'production':
      console.log('⚠️  Production environment - skipping seed');
      break;
    default:
      console.log('ℹ️  No environment specified - skipping seed');
      break;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
