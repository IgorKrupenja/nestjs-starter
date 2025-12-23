#!/usr/bin/env tsx

/**
 * Script to start the test database and run migrations
 * This combines starting the Docker container and running Prisma migrations
 */

import { execSync } from 'node:child_process';

const testDatabaseUrl =
  process.env.TEST_DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5433/nestjs_starter_test?schema=starter';

console.log('🚀 Starting test database and running migrations...\n');

try {
  // Check if db-test container is already running
  console.log('1️⃣ Checking test database status...');
  try {
    const result = execSync('docker compose ps db-test --format json', {
      encoding: 'utf-8',
    });
    const containerInfo = JSON.parse(result) as { State?: string };

    if (containerInfo.State === 'running') {
      console.log('   ✓ Test database is already running');
    } else {
      console.log('   Starting test database container...');
      execSync('docker compose up db-test -d', { stdio: 'inherit' });
      console.log('   ✓ Test database started');

      // Wait for database to be ready
      console.log('   Waiting for database to be ready...');
      execSync('sleep 3');
    }
  } catch {
    // Container doesn't exist, start it
    console.log('   Starting test database container...');
    execSync('docker compose up db-test -d', { stdio: 'inherit' });
    console.log('   ✓ Test database started');

    // Wait for database to be ready
    console.log('   Waiting for database to be ready...');
    execSync('sleep 3');
  }

  console.log('\n2️⃣ Running Prisma migrations on test database...');
  execSync('pnpm exec prisma migrate deploy', {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: testDatabaseUrl,
    },
  });

  console.log('\n✅ Test database is ready!');
  console.log('🧪 You can now run e2e tests with: pnpm test:e2e\n');
} catch (error) {
  console.error('\n❌ Failed to set up test database');
  console.error(error);
  process.exit(1);
}
