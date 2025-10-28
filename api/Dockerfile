# Unified API Service Dockerfile with multi-stage support
# Use: --target development for dev, --target production (default) for prod

FROM node:18-alpine AS base
WORKDIR /app

# ============================================
# Development Stage
# ============================================
FROM base AS development

# Install dependencies
COPY package.json package-lock.json* pnpm-lock.yaml* ./
COPY prisma ./prisma/

RUN \
  if [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm install; \
  elif [ -f package-lock.json ]; then npm ci; \
  else npm install --legacy-peer-deps; \
  fi

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

EXPOSE 3001
ENV PORT=3001
ENV NODE_ENV=development

CMD ["npm", "run", "dev"]

# ============================================
# Production Dependencies Stage
# ============================================
FROM base AS deps
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci --legacy-peer-deps; \
  else npm install --legacy-peer-deps --no-package-lock; \
  fi

# ============================================
# Production Stage
# ============================================
FROM base AS production

ENV NODE_ENV=production

# Copy dependencies (install all deps including devDependencies for tsx)
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm install; \
  elif [ -f package-lock.json ]; then npm ci --legacy-peer-deps; \
  else npm install --legacy-peer-deps --no-package-lock; \
  fi

# Copy application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 api

RUN chown -R api:nodejs /app

USER api

EXPOSE 3001
ENV PORT=3001

# Use tsx to run TypeScript directly (no build step needed)
CMD ["npx", "tsx", "server.ts"]
