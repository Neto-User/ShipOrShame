# ---- Build stage ----
FROM node:22-slim AS builder
WORKDIR /app

# Prisma needs openssl at build time for engine selection.
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

RUN corepack enable
COPY package.json pnpm-lock.yaml* .npmrc* svelte.config.* ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile --config.enable-pre-post-scripts=true || pnpm install --config.enable-pre-post-scripts=true
COPY . .
RUN pnpm exec prisma generate
RUN pnpm run build
# Prune dev dependencies for a lean runtime.
RUN pnpm prune --prod

# ---- Runtime stage ----
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# Apply migrations then boot the adapter-node server.
CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy && node build"]
