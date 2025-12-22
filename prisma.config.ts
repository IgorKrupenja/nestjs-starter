import { defineConfig, PrismaConfig } from 'prisma/config';

export default defineConfig({
  migrations: {
    // todo likely needs ts node or similar
    seed: 'node ./prisma/seeders/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
}) satisfies PrismaConfig;
