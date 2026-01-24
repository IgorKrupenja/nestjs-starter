#!/usr/bin/env bash

# Exit immediately if any command fails
set -euo pipefail

docker compose up db-test -d --wait

sleep 1

DATABASE_URL="postgresql://postgres:postgres@localhost:5433/nestjs_starter_test?schema=starter" \
    pnpm exec prisma migrate deploy
