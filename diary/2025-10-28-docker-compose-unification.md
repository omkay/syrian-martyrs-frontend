# Docker Compose Unification

**Date**: October 28, 2025  
**Goal**: Merge separate docker-compose files into one with profiles

---

## Problem

Previously had two separate docker-compose files:
- `docker-compose.yml` - Mixed dev/prod with profiles
- `docker-compose.dev.yml` - Separate dev configuration

This created:
- Duplicate configuration
- Confusion about which file to use
- Maintenance burden

---

## Solution

**Merged everything into a single `docker-compose.yml` with profiles:**

### Structure

```yaml
services:
  # Development profile
  postgres-dev:
    profiles: [development]
  redis-dev:
    profiles: [development]
  api-dev:
    profiles: [development]
  web-dev:
    profiles: [development]
  
  # Production profile
  postgres-prod:
    profiles: [production]
  redis-prod:
    profiles: [production]
  api-prod:
    profiles: [production]
  web-prod:
    profiles: [production]
```

### Key Features

1. **Separate Infrastructure**
   - Dev and prod have their own postgres/redis instances
   - Different ports to allow running both simultaneously

2. **Port Mapping**
   - Development: 3000 (web), 3001 (api), 5432 (postgres), 6379 (redis)
   - Production: 3100 (web), 3002 (api), 5433 (postgres), 6380 (redis)

3. **Profile-Based Activation**
   ```bash
   # Start dev
   docker-compose --profile development up -d
   
   # Start prod
   docker-compose --profile production up -d
   
   # Run both simultaneously (if needed)
   docker-compose --profile development --profile production up -d
   ```

---

## Changes Made

### Files Modified
- ✅ `docker-compose.yml` - Unified configuration with profiles

### Files Deleted
- ❌ `docker-compose.dev.yml` - No longer needed

### Documentation Updated
- ✅ `DOCKER_QUICK_START.md` - Updated all commands to use single file

---

## Usage

### Development
```bash
# Start
docker-compose --profile development up -d

# Stop
docker-compose --profile development down

# Logs
docker-compose logs -f api-dev

# Access
- Web: http://localhost:3000
- API: http://localhost:3001
```

### Production
```bash
# Start
docker-compose --profile production up -d

# Stop
docker-compose --profile production down

# Logs
docker-compose logs -f api-prod

# Access
- Web: http://localhost:3100
- API: http://localhost:3002
```

---

## Benefits

### 1. Single Source of Truth ✅
- One file to maintain
- No confusion about which file to use
- Easier to understand the full stack

### 2. Environment Isolation ✅
- Dev and prod can run simultaneously
- Separate databases and caches
- No port conflicts

### 3. Simplified Commands ✅
- No need to specify `-f docker-compose.dev.yml`
- Consistent command structure
- Profile-based activation

### 4. Better Organization ✅
- Clear separation via profiles
- Easy to see all services at once
- Follows Docker Compose best practices

---

## Service Naming

Changed naming convention for clarity:

**Before:**
- `postgres` (ambiguous)
- `redis` (ambiguous)
- `api` / `api-dev` (mixed)

**After:**
- `postgres-dev` / `postgres-prod` (clear)
- `redis-dev` / `redis-prod` (clear)
- `api-dev` / `api-prod` (clear)
- `web-dev` / `web-prod` (clear)

---

## Port Allocation

| Service | Dev Port | Prod Port | Notes |
|---------|----------|-----------|-------|
| Web | 3000 | 3100 | +100 for prod |
| API | 3001 | 3002 | +1 for prod |
| PostgreSQL | 5432 | 5433 | +1 for prod |
| Redis | 6379 | 6380 | +1 for prod |

---

## Backward Compatibility

### Old Commands (no longer work)
```bash
# ❌ This will fail
docker-compose -f docker-compose.dev.yml up -d
```

### New Commands
```bash
# ✅ Use this instead
docker-compose --profile development up -d
```

---

## Validation

```bash
# Validate configuration
docker-compose config

# List services in dev profile
docker-compose --profile development config --services

# List services in prod profile
docker-compose --profile production config --services
```

---

## Summary

Successfully consolidated two docker-compose files into one unified configuration with proper profile separation. This provides:

- ✅ Single source of truth
- ✅ Environment isolation
- ✅ Simpler commands
- ✅ Better organization
- ✅ Can run dev and prod simultaneously

**Files Modified**: 2  
**Files Deleted**: 1  
**Net Result**: Cleaner, more maintainable Docker Compose setup

