# 🤓 Syrian Martyrs Memorial - Docker Quick Start Guide

## ✅ Current Status
All services are **running successfully** with unified Docker setup!

---

## 🎯 Architecture Overview

This project uses a **modern unified Docker setup**:
- **Single `docker-compose.yml`** with profiles (no separate files)
- **Single Dockerfile per service** with multi-stage builds (no `.dev` files)
- **Profile-based environments**: `development` and `production`
- **Build targets** control packaging (`development` vs `production`)
- **Same packaging** for dev and prod (prevents environment drift)
- **Hot reload** enabled for development with volume mounts
- **Isolated environments** (dev and prod can run simultaneously)

---

## 🚀 Quick Commands

### Development Environment

```bash
# Start all services
docker-compose --profile development up -d

# Stop services
docker-compose --profile development down

# View logs
docker-compose --profile development logs -f

# Check status
docker-compose --profile development ps
```

### Production Environment

```bash
# Start production services
docker-compose --profile production up -d

# Stop services
docker-compose --profile production down

# View logs
docker-compose --profile production logs -f
```

---

## 🌐 Service URLs

### Development Environment
| Service | URL | Status |
|---------|-----|--------|
| **Web Frontend** | http://localhost:3000 | ✅ Running |
| **API Backend** | http://localhost:3001 | ✅ Running |
| **PostgreSQL** | localhost:5432 | ✅ Healthy |
| **Redis** | localhost:6379 | ✅ Healthy |

### Production Environment
| Service | URL | Status |
|---------|-----|--------|
| **Web Frontend** | http://localhost:3100 | ✅ Running |
| **API Backend** | http://localhost:3002 | ✅ Running |
| **PostgreSQL** | localhost:5433 | ✅ Healthy |
| **Redis** | localhost:6380 | ✅ Healthy |

---

## 📐 Docker Architecture

### Unified Dockerfile Structure

Each service has **one Dockerfile** with multiple build stages:

```
┌─────────────────────────────────┐
│    Base Stage (node:18-alpine)  │
└──────────┬──────────────────────┘
           │
    ┌──────┴──────┐
    ▼             ▼
┌────────┐   ┌────────┐
│  Dev   │   │  Deps  │
│ Stage  │   │ Stage  │
└────────┘   └────┬───┘
                  │
             ┌────▼────┐
             │ Builder │
             │  Stage  │
             └────┬────┘
                  │
             ┌────▼────┐
             │  Prod   │
             │  Stage  │
             └─────────┘
```

### Build Targets

**Development**: 
- Uses `--target development`
- Includes all dependencies
- No build step (hot reload)
- Source code mounted as volumes

**Production**:
- Uses `--target production` (or default)
- Multi-stage optimized build
- Only production dependencies
- Compiled/built artifacts
- Non-root user for security

---

## 📡 API Endpoints

### Health Checks
```bash
# API Health
curl http://localhost:3001/health
# Response: {"status":"ok","service":"api"}
```

### Admin APIs
- `GET /api/admin/stats` - Statistics
- `GET /api/admin/users` - List users
- `GET /api/admin/martyrs` - List martyrs
- `GET /api/admin/contributions` - List contributions

### Public APIs
- `GET /api/contributions?userId=xxx` - User contributions
- `GET /api/health` - Health check

---

## 🛠️ Database Commands

### Run Migrations
```bash
docker-compose exec api-dev npx prisma migrate dev
```

### Seed Database
```bash
docker-compose exec api-dev npm run db:seed
```

### Open Prisma Studio
```bash
docker-compose exec api-dev npx prisma studio
```

### Create Admin User
```bash
docker-compose exec api-dev npx tsx scripts/create-admin-user.ts
```

---

## 🔨 Building Images

### Build Development Images
```bash
# API
docker build --target development -t syrian-martyrs-api:dev ./api

# Web
docker build --target development -t syrian-martyrs-web:dev ./web
```

### Build Production Images
```bash
# API (default target is production)
docker build -t syrian-martyrs-api:prod ./api

# Web (default target is production)
docker build -t syrian-martyrs-web:prod ./web

# Or explicitly specify target
docker build --target production -t syrian-martyrs-api:prod ./api
docker build --target production -t syrian-martyrs-web:prod ./web
```

---

## 🔍 Troubleshooting

### View Container Logs
```bash
# Web logs
docker-compose logs -f web-dev

# API logs
docker-compose logs -f api-dev

# Database logs
docker-compose logs -f postgres-dev
```

### Restart a Service
```bash
# Restart web
docker-compose restart web-dev

# Restart API
docker-compose restart api-dev
```

### Rebuild and Restart
```bash
# Rebuild specific service
docker-compose --profile development up --build -d api-dev

# Rebuild all services
docker-compose --profile development up --build -d
```

### Clean Everything
```bash
# Stop and remove containers
docker-compose --profile development down

# Stop, remove containers and volumes
docker-compose --profile development down -v

# Nuclear option: remove everything including images
docker-compose --profile development down -v --rmi all
```

### Common Issues

**Port conflicts**:
```bash
# Check what's using the port
lsof -i :3000
lsof -i :3001

# Kill the process or stop the containers
docker-compose -f docker-compose.dev.yml down
```

**Volume issues**:
```bash
# Remove node_modules volumes and rebuild
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up --build -d
```

---

## 📦 Tech Stack

- **Frontend**: Next.js 15.2.4 + React 19 + Tailwind + Shadcn/UI
- **Backend**: Express.js + Prisma 6.15.0
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Auth**: JWT + bcryptjs
- **Containerization**: Docker with multi-stage builds

---

## 🎓 Benefits of Unified Dockerfiles

✅ **No environment drift** - Same Dockerfile ensures consistency  
✅ **Easier maintenance** - Single file to update  
✅ **Production parity** - Dev uses same base as prod  
✅ **Cleaner repo** - Fewer files to manage  
✅ **Build targets** - Flexible for different environments  

---

## 📚 More Details

See detailed documentation in `/diary/`:
- `2025-10-23-SUMMARY.md` - Complete overview
- `2025-10-23-docker-setup-success.md` - Setup process
- `2025-10-23-codebase-analysis.md` - Codebase analysis

---

**Status**: ✅ All services running with unified Dockerfiles  
**Last Updated**: October 28, 2025
