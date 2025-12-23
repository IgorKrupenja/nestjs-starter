# E2E Tests

This directory contains end-to-end (E2E) tests for the NestJS application.

## Database Isolation

E2E tests use a **separate PostgreSQL database** for complete isolation from development data. This means:

- ✅ Tests don't interfere with your development database
- ✅ Separate Docker container on port 5433
- ✅ Easy to start/stop independently
- ✅ Uses real Prisma migrations (no hardcoded schemas)

## Structure

```
test/
├── helpers/           # Test utilities and helpers
│   ├── test-app.ts   # NestJS app initialization for tests
│   └── database.ts   # Database cleanup utilities
└── *.e2e-spec.ts     # E2E test files
```

## Setup

**1. Start the test database:**

```bash
docker compose up db-test -d
```

This starts a separate PostgreSQL instance on port 5433.

**2. Run migrations on the test database:**

```bash
pnpm test:e2e:setup
```

This runs Prisma migrations on the test database using your existing migration files.

## Running E2E Tests

```bash
# Run e2e tests in watch mode
pnpm test:e2e

# Run e2e tests once
pnpm test:e2e:run
```

## Writing E2E Tests

E2E tests should follow the naming convention `*.e2e-spec.ts`.

### Example Test Structure

```typescript
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createTestApp } from './helpers/test-app.js';
import { DatabaseHelper } from './helpers/database.js';

describe('Feature API (E2E)', () => {
  let app: INestApplication;
  let dbHelper: DatabaseHelper;

  beforeAll(async () => {
    app = await createTestApp();
    dbHelper = new DatabaseHelper();
  });

  afterAll(async () => {
    await dbHelper.disconnect();
    await app.close();
  });

  beforeEach(async () => {
    // Clean database before each test
    await dbHelper.cleanDatabase();
    
    // Set up test data
    // ...
  });

  it('should test something', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/endpoint')
      .expect(200);

    expect(response.body).toMatchObject({
      // assertions
    });
  });
});
```

## Test Helpers

### `createTestApp()`

Creates a fully configured NestJS application instance for testing. This ensures that the test app has the same configuration as the production app (validation pipes, filters, etc.).

### `DatabaseHelper`

Provides utilities for managing test database state:

- `cleanDatabase()` - Removes all data from the database
- `disconnect()` - Closes the database connection
- `getClient()` - Returns the Prisma client for direct database access

## Best Practices

1. **Test Isolation**: Always clean the database before or after each test to ensure tests don't affect each other
2. **Sequential Execution**: E2E tests run sequentially (maxConcurrency: 1) to avoid database conflicts
3. **Realistic Data**: Create realistic test data that matches production scenarios
4. **HTTP Assertions**: Use `supertest` for making HTTP requests and assertions
5. **Status Codes**: Always assert the expected HTTP status code
6. **Response Shape**: Verify the structure and content of API responses
7. **Database Isolation**: Tests use a separate PostgreSQL database (port 5433), completely isolated from development (port 5432)

## Configuration

E2E tests use a separate Vitest configuration file: `vitest.config.e2e.mts`

Key configuration options:

- Tests run sequentially (maxConcurrency: 1) to prevent database conflicts
- Longer timeouts (30s) to accommodate database operations
- Includes only `**/*.e2e-spec.ts` files
- Path alias for `@src`
- Test database runs on port 5433 (separate from dev on 5432)
