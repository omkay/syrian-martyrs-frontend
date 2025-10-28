# Unified Root Dockerfile with multi-stage support
# Use: --target development for dev, --target production (default) for prod

FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# ============================================
# Development Stage
# ============================================
FROM base AS development

# Copy package files
COPY package.json pnpm-lock.yaml* package-lock.json* ./

# Install dependencies
RUN \
  if [ -f pnpm-lock.yaml ]; then pnpm install; \
  elif [ -f package-lock.json ]; then npm ci; \
  else npm install; \
  fi

# Copy source code
COPY . .

EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=development

CMD ["pnpm", "dev"]

# ============================================
# Production Dependencies Stage
# ============================================
FROM base AS deps
RUN apk add --no-cache libc6-compat

COPY package.json pnpm-lock.yaml* package-lock.json* ./

RUN \
  if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci --legacy-peer-deps; \
  else npm install --legacy-peer-deps --no-package-lock; \
  fi

# ============================================
# Builder Stage
# ============================================
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN \
  if [ -f pnpm-lock.yaml ]; then pnpm run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  else npm run build; \
  fi

# ============================================
# Production Stage
# ============================================
FROM base AS production

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next && chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
