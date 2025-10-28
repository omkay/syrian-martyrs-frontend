# Docker Unification - Consolidated Dev and Prod Dockerfiles

**Date**: October 28, 2025  
**Goal**: Eliminate separate dev/prod Dockerfiles to prevent environment drift

---

## Problem

The codebase had separate Dockerfiles for development and production:
- `api/Dockerfile` and `api/Dockerfile.dev`
- `web/Dockerfile` and `web/Dockerfile.dev`
- Root `Dockerfile` and `Dockerfile.dev`

**Issues**:
- Risk of environment drift between dev and prod
- Duplicate maintenance burden
- Unclear which file defines the canonical build
- Different packaging could lead to "works on my machine" issues

---

## Solution

Implemented **unified multi-stage Dockerfiles** using Docker build targets:

### Architecture

Each service now has **one Dockerfile** with multiple stages:

```dockerfile
FROM node:18-alpine AS base
# Common setup

FROM base AS development
# Dev-specific: hot reload, all deps, source mounted
CMD ["npm", "run", "dev"]

FROM base AS deps
# Install production dependencies

FROM base AS builder
# Build artifacts (prod only)

FROM base AS production
# Optimized prod image with built artifacts
CMD ["node", "dist/server.js"]
```

### Key Features

1. **Build Targets**:
   - Development: `--target development`
   - Production: `--target production` (default)

2. **Development Stage**:
   - All dependencies (including devDependencies)
   - No build step
   - Hot reload enabled
   - Source code mounted as volumes

3. **Production Stage**:
   - Multi-stage optimized build
   - Only production dependencies
   - Compiled/built artifacts only
   - Non-root user for security
   - Smaller image size

---

## Changes Made

### 1. Unified API Dockerfile (`api/Dockerfile`)
- ✅ Development stage with hot reload
- ✅ Production stage with multi-stage build
- ✅ Supports npm, pnpm, or package-lock
- ✅ Prisma generation in both stages
- ✅ Non-root user (api:nodejs) in production

### 2. Unified Web Dockerfile (`web/Dockerfile`)
- ✅ Development stage with Next.js dev server
- ✅ Production stage with standalone output
- ✅ Optimized for Next.js output traces
- ✅ Non-root user (nextjs:nodejs) in production
- ✅ Telemetry disabled

### 3. Unified Root Dockerfile (`Dockerfile`)
- ✅ pnpm support
- ✅ Development and production targets
- ✅ Next.js standalone build

### 4. Updated docker-compose.yml
```yaml
api:
  build:
    context: ./api
    dockerfile: Dockerfile
    target: production  # Explicit target
    
api-dev:
  build:
    context: ./api
    dockerfile: Dockerfile
    target: development  # Same file, different target
  volumes:
    - ./api:/app  # Hot reload in dev only
```

### 5. Updated docker-compose.dev.yml
- Now uses same Dockerfiles with `target: development`

### 6. Removed Files
- ❌ `api/Dockerfile.dev` (deleted)
- ❌ `web/Dockerfile.dev` (deleted)
- ❌ `Dockerfile.dev` (deleted)

---

## Usage

### Development
```bash
# Using docker-compose.dev.yml (simpler)
docker-compose -f docker-compose.dev.yml up -d

# Or using profiles in main compose file
docker-compose --profile development up -d

# Manual build
docker build --target development -t api:dev ./api
```

### Production
```bash
# Using profiles
docker-compose --profile production up -d

# Manual build (default target is production)
docker build -t api:prod ./api

# Or explicitly
docker build --target production -t api:prod ./api
```

---

## Benefits

### 1. No Environment Drift
- ✅ Same base image for dev and prod
- ✅ Same dependency installation logic
- ✅ Same file structure

### 2. Easier Maintenance
- ✅ Single file to update per service
- ✅ Changes apply to both environments
- ✅ Clearer to understand

### 3. Production Parity
- ✅ Dev environment mirrors prod packaging
- ✅ Build issues caught in dev
- ✅ Reduces "works on my machine" problems

### 4. Flexibility
- ✅ Can build either target independently
- ✅ Can add more targets (test, staging, etc.)
- ✅ Environment-specific optimizations in place

---

## Technical Details

### Multi-Stage Build Flow

**Development Target**:
```
base → development
     ↓
  npm run dev
  (with volumes)
```

**Production Target**:
```
base → deps → builder → production
     ↓        ↓          ↓
  install  build    optimized runtime
```

### Package Manager Support

All Dockerfiles support multiple package managers:
```dockerfile
RUN \
  if [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm install; \
  elif [ -f package-lock.json ]; then npm ci; \
  else npm install; \
  fi
```

### Volume Mounts

Development uses volumes for hot reload:
```yaml
volumes:
  - ./api:/app        # Source code
  - /app/node_modules # Don't overwrite installed deps
  - /app/.next        # Preserve Next.js build cache
```

Production has no volumes (uses built artifacts).

---

## Testing

### Verified Functionality

✅ Development builds work
✅ Production builds work  
✅ Hot reload works in development
✅ Optimized production images
✅ Same Dockerfile used for both environments

### Commands to Test

```bash
# Build dev
docker build --target development -t api:dev ./api
docker build --target development -t web:dev ./web

# Build prod
docker build --target production -t api:prod ./api
docker build --target production -t web:prod ./web

# Verify with compose
docker-compose -f docker-compose.dev.yml up --build -d
docker-compose --profile production up --build -d
```

---

## Documentation Updated

- ✅ `DOCKER_QUICK_START.md` - Added multi-stage architecture section
- ✅ Added build target examples
- ✅ Updated commands for new structure
- ✅ Added troubleshooting section
- ✅ Created this diary entry

---

## Next Steps

Potential improvements:
1. Add `test` build target for CI/CD
2. Add `staging` target with different optimizations
3. Consider BuildKit cache mounts for faster builds
4. Add healthchecks in Dockerfiles

---

## Summary

Successfully consolidated 6 Dockerfiles into 3 unified multi-stage Dockerfiles. Each service now has a single source of truth for containerization that supports both development and production environments through build targets. This eliminates environment drift and simplifies maintenance while maintaining all functionality.

**Files Modified**: 5  
**Files Deleted**: 3  
**Lines Added**: ~150  
**Lines Removed**: ~100  
**Net Result**: Cleaner, more maintainable Docker setup

