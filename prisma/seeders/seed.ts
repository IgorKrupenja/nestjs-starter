import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
