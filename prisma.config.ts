import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: `tsx prisma/seeders/seed.ts --environment=${process.env['NODE_ENV'] || 'development'}`,
  },
  datasource: {
    url: process.env['DATABASE_URL'],
  },
});
