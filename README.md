# NestJS starter

## Description

NestJS starter project. Uses Postgres and Prisma ORM.

## Set up the project

This project requires Node 22.14. If you do not have it, the easiest option is to install [nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

Run the following commands **or just the `./setup.sh` that will do this automatically** (and will also install `nvm` if it's missing). This script is especially useful if you are not a Node developer and do not have all the tools ready.

```bash
# Install the correct Node version
nvm install
# Install the correct pnpm version
corepack enable pnpm
corepack up
# Install dependencies
pnpm install
cp .env.example .env
# Start DB
docker compose up -d
# Prepare Prisma
pnpm exec prisma migrate dev
pnpm exec prisma generate
pnpm exec prisma db seed
```

## Environment Variables

| Variable | Description | Required | Default Value | Recommended Production Value |
|----------|-------------|----------|---------------|------------------------------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ Yes | N/A | |
| `LOGGER_LOG_LEVELS` | Comma-separated log levels (error, warn, log, debug) |  | `error,warn,log` | `error,warn,log` |
| `LOGGER_COLORS` | Enable colored console output |  | `false` | `false` |

**[Example `.env` file](.env.example).**

## Run the project

```bash
pnpm run dev
```

## Run tests

```bash
# Unit tests in watch mode
pnpm run test

# Unit tests (run once)
pnpm run test:run

# Test coverage
pnpm run test:cov

# E2E tests in watch mode
pnpm run test:e2e

# E2E tests (run once)
pnpm run test:e2e:run
```

See [test/README.md](test/README.md) for more information about E2E testing.

## Lint

```bash
pnpm run lint
```

## Format

```bash
pnpm run format
```

## Testing Docker image

**You should NEVER use this to run locally**. This is only for testing the Docker image.

```bash
docker build -t nestjs-starter . --no-cache

docker run \
    -p 3000:3000 \
    -e DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/nestjs_starter?schema=starter" \
    nestjs-starter
```
