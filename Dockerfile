FROM node:22.14-alpine AS base

# Enable pnpm
RUN corepack enable pnpm

FROM base AS dependencies

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

FROM base AS build

WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN pnpm exec prisma generate
RUN pnpm run build

FROM base AS deploy

WORKDIR /app
COPY --from=build /app/dist/ ./dist/
COPY --from=build /app/node_modules ./node_modules
COPY prisma ./prisma
COPY package.json ./

CMD [ "npm", "run", "start:prod" ]