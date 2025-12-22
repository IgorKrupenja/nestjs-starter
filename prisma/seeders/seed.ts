import { parseArgs } from 'node:util';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../../src/generated/prisma/client.js';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});

const prisma = new PrismaClient({ adapter });

const options = {
  environment: { type: 'string' as const },
};

async function seedDevelopment(): Promise<void> {
  console.log('🌱 Seeding development data...');

  const user1 = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      name: 'Alice',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      name: 'Bob',
    },
  });

  await Promise.all([
    prisma.post.create({
      data: {
        title: 'First Post',
        content: 'This is the first post content.',
        published: true,
        authorId: user1.id,
      },
    }),
    prisma.post.create({
      data: {
        title: 'Second Post',
        content: 'Content for the second post.',
        published: false,
        authorId: user1.id,
      },
    }),
    prisma.post.create({
      data: {
        title: 'Third Post',
        content: 'Another post, this time by Bob.',
        published: true,
        authorId: user2.id,
      },
    }),
    prisma.post.create({
      data: {
        title: 'Fourth Post',
        content: "Bob's second post.",
        published: true,
        authorId: user2.id,
      },
    }),
    prisma.post.create({
      data: {
        title: 'Fifth Post',
        content: "Alice's third post, still in draft.",
        published: false,
        authorId: user1.id,
      },
    }),
  ]);

  console.log('✅ Development data seeded successfully!');
}

async function main(): Promise<void> {
  const {
    values: { environment },
  } = parseArgs({ options });

  switch (environment) {
    case 'development':
      await seedDevelopment();
      break;
    case 'test':
      // Add test data here if needed
      console.log('🧪 Test environment - no seed data configured');
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
