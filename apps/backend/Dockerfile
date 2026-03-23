FROM node:20-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN pnpm install --frozen-lockfile

COPY apps/backend ./apps/backend
COPY packages/shared ./packages/shared

RUN pnpm --filter @event-ops/shared build
RUN pnpm --filter backend build

EXPOSE 3001

CMD ["sh", "-c", "pnpm --filter backend db:migrate && pnpm --filter backend start"]
