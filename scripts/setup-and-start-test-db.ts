#!/usr/bin/env tsx

/**
 * Script to start the test database and run migrations
 */

import { execSync } from 'node:child_process';

console.log('🚀 Starting test database and running migrations...\n');

try {
  console.log('1️⃣ Starting test database container...');
  // docker compose up -d is idempotent
  // it will start the container if it's not running
  // or do nothing if it's already running
  execSync('docker compose up db-test -d --wait', { stdio: 'inherit' });

  console.log('\n2️⃣ Running Prisma migrations on test database...');
  execSync('pnpm exec prisma migrate deploy', {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL:
        process.env.DATABASE_URL ||
        'postgresql://postgres:postgres@localhost:5433/nestjs_starter_test?schema=starter',
    },
  });

  console.log('\n✅ Test database is ready!');
  console.log('🧪 You can now run e2e tests with: pnpm test:e2e\n');
} catch (error) {
  console.error('\n❌ Failed to set up test database');
  console.error(error);
  process.exit(1);
}
