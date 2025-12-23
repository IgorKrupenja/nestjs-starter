#!/usr/bin/env tsx

/**
 * Script to set up the test database
 * This runs Prisma migrations on the test database
 */

import { execSync } from 'node:child_process';

const testDatabaseUrl =
  process.env.TEST_DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5433/nestjs_starter_test?schema=starter';

console.log('🔧 Setting up test database...');
console.log(`📍 Using database: ${testDatabaseUrl.replace(/:[^:@]+@/, ':****@')}`);

try {
  console.log('\n📦 Running Prisma migrations on test database...');
  execSync('pnpm exec prisma migrate deploy', {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: testDatabaseUrl,
    },
  });

  console.log('\n✅ Test database setup complete!');
  console.log('🧪 You can now run e2e tests with: pnpm test:e2e\n');
} catch (error) {
  console.error('\n❌ Failed to set up test database');
  console.error(error);
  process.exit(1);
}
