# Paradigm worker (Railway). Build context: repo root. RAILWAY_DOCKERFILE_PATH=apps/worker/Dockerfile
FROM node:22-slim
RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg ca-certificates \
  && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/worker/package.json apps/worker/package.json
COPY apps/agent/package.json apps/agent/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/db/package.json packages/db/package.json
RUN pnpm install --frozen-lockfile --filter "@adx/worker..." --ignore-scripts
COPY packages ./packages
COPY apps/worker ./apps/worker
ENV NODE_ENV=production CLIP_DIR=/tmp/clips PORT=8080
RUN mkdir -p /tmp/clips && chown -R node:node /tmp/clips
USER node
EXPOSE 8080
CMD ["node", "--import", "tsx", "apps/worker/src/main.ts"]
