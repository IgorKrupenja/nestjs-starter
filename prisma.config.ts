import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

// Load environment-specific .env file from config folder
const environment = process.env['NODE_ENV'] || 'development';
config({ path: `config/${environment}.env` });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: `tsx prisma/seeders/seed.ts --environment=${environment}`,
  },
  datasource: {
    url: process.env['DATABASE_URL'],
  },
});
