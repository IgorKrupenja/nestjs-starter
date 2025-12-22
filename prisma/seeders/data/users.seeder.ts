import type { PrismaClient } from '../../../src/generated/prisma/client.js';

export async function seedUsers(prisma: PrismaClient): Promise<void> {
  console.log('  → Seeding users...');

  const user1 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      name: 'Alice',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      name: 'Bob',
    },
  });

  console.log(`    ✓ Created/verified ${[user1, user2].length} users`);

  return;
}
