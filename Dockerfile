FROM node:22.21-alpine AS base

RUN corepack enable pnpm

FROM base AS dependencies

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
# Install all deps (including prisma CLI), generate client, then prune to prod only
RUN pnpm install --frozen-lockfile
RUN pnpm exec prisma generate
RUN pnpm prune --prod

FROM base AS build

WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/src/generated ./src/generated
RUN pnpm install --frozen-lockfile
RUN pnpm run build

FROM node:22.21-alpine AS deploy

WORKDIR /app
COPY --from=build /app/dist/ ./dist/
COPY --from=dependencies /app/node_modules ./node_modules
COPY prisma ./prisma
COPY package.json ./

RUN chown -R node:node /app
USER node

ENV NO_COLOR=true

EXPOSE 3000
CMD [ "npm", "run", "start:prod" ]