# NestJS starter

## Description

NestJS starter project. Uses Postgres and Prisma ORM.

## Set up the project

This project requires Node 22.14. If you do not have it, the easiest option is to install [nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

Run the following commands **or just the `./setup.sh` that will do this automatically** (and will also install `nvm` if it's missing).

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

## Run the project

```bash
pnpm run dev
```

## Run tests

```bash
# Unit tests in watch mode
pnpm run test

# Test coverage
pnpm run test:cov
```

## Lint, format, import sort

```bash
pnpm run lint
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
