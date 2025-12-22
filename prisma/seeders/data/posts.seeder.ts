import type { PrismaClient } from '@src/generated/prisma/client.js';

export async function seedPosts(prisma: PrismaClient): Promise<void> {
  console.log('  → Seeding posts...');

  // Get users first
  const alice = await prisma.user.findUnique({
    where: { email: 'alice@example.com' },
  });

  const bob = await prisma.user.findUnique({
    where: { email: 'bob@example.com' },
  });

  if (!alice || !bob) {
    throw new Error('Users must be seeded before posts');
  }

  const posts = await Promise.all([
    prisma.post.upsert({
      where: { id: 1000 }, // Use high IDs to avoid conflicts
      update: {},
      create: {
        title: 'First Post',
        content: 'This is the first post content.',
        published: true,
        authorId: alice.id,
      },
    }),
    prisma.post.upsert({
      where: { id: 1001 },
      update: {},
      create: {
        title: 'Second Post',
        content: 'Content for the second post.',
        published: false,
        authorId: alice.id,
      },
    }),
    prisma.post.upsert({
      where: { id: 1002 },
      update: {},
      create: {
        title: 'Third Post',
        content: 'Another post, this time by Bob.',
        published: true,
        authorId: bob.id,
      },
    }),
    prisma.post.upsert({
      where: { id: 1003 },
      update: {},
      create: {
        title: 'Fourth Post',
        content: "Bob's second post.",
        published: true,
        authorId: bob.id,
      },
    }),
    prisma.post.upsert({
      where: { id: 1004 },
      update: {},
      create: {
        title: 'Fifth Post',
        content: "Alice's third post, still in draft.",
        published: false,
        authorId: alice.id,
      },
    }),
  ]);

  console.log(`    ✓ Created/verified ${posts.length} posts`);

  return;
}
