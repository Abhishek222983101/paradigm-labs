# Paradigm buyer agent (Railway). Build context: repo root. RAILWAY_DOCKERFILE_PATH=apps/agent/Dockerfile
FROM node:22-slim
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/worker/package.json apps/worker/package.json
COPY apps/agent/package.json apps/agent/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/db/package.json packages/db/package.json
RUN pnpm install --frozen-lockfile --filter "@adx/agent..." --ignore-scripts
COPY packages ./packages
COPY apps/agent ./apps/agent
ENV NODE_ENV=production
USER node
CMD ["node", "--import", "tsx", "apps/agent/src/main.ts"]
