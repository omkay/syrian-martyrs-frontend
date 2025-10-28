# Unified Web Service Dockerfile with multi-stage support
# Use: --target development for dev, --target production (default) for prod

FROM node:18-alpine AS base
WORKDIR /app

# ============================================
# Development Stage
# ============================================
FROM base AS development

# Install dependencies
COPY package.json package-lock.json* pnpm-lock.yaml* ./

RUN \
  if [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm install; \
  elif [ -f package-lock.json ]; then npm ci --legacy-peer-deps; \
  else npm install --legacy-peer-deps; \
  fi

# Copy source code
COPY . .

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
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
# Builder Stage
# ============================================
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Uncomment the following line to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED=1

RUN \
  if [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
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

# Set the correct permission for prerender cache
RUN mkdir .next && chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# server.js is created by next build from the standalone output
CMD ["node", "server.js"]
