FROM node:22.14-alpine AS base

RUN corepack enable pnpm
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

FROM base AS dependencies

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN pnpm install --prod --frozen-lockfile
RUN pnpm exec prisma generate

FROM base AS build

WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN pnpm install --frozen-lockfile
RUN pnpm run build

FROM base AS deploy

WORKDIR /app
COPY --from=build /app/dist/ ./dist/
COPY --from=dependencies /app/node_modules ./node_modules
COPY prisma ./prisma
COPY package.json ./

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 3000
CMD [ "pnpm", "run", "start:prod" ]