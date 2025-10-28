# 🤓 Syrian Martyrs Memorial - Docker Quick Start Guide

## ✅ Current Status
All services are **running successfully**!

---

## 🚀 Quick Commands

### Start Services
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Stop Services
```bash
docker-compose -f docker-compose.dev.yml down
```

### View Logs
```bash
docker-compose -f docker-compose.dev.yml logs -f
```

### Check Status
```bash
docker-compose -f docker-compose.dev.yml ps
```

---

## 🌐 Service URLs

| Service | URL | Status |
|---------|-----|--------|
| **Web Frontend** | http://localhost:3000 | ✅ Running |
| **API Backend** | http://localhost:3001 | ✅ Running |
| **PostgreSQL** | localhost:5432 | ✅ Healthy |
| **Redis** | localhost:6379 | ✅ Healthy |

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
docker-compose -f docker-compose.dev.yml exec api-dev npx prisma migrate dev
```

### Seed Database
```bash
docker-compose -f docker-compose.dev.yml exec api-dev npm run db:seed
```

### Open Prisma Studio
```bash
docker-compose -f docker-compose.dev.yml exec api-dev npx prisma studio
```

### Create Admin User
```bash
docker-compose -f docker-compose.dev.yml exec api-dev npx tsx scripts/create-admin-user.ts
```

---

## 🔍 Troubleshooting

### View Container Logs
```bash
# Web logs
docker-compose -f docker-compose.dev.yml logs -f web-dev

# API logs
docker-compose -f docker-compose.dev.yml logs -f api-dev

# Database logs
docker-compose -f docker-compose.dev.yml logs -f postgres
```

### Restart a Service
```bash
# Restart web
docker-compose -f docker-compose.dev.yml restart web-dev

# Restart API
docker-compose -f docker-compose.dev.yml restart api-dev
```

### Rebuild and Restart
```bash
docker-compose -f docker-compose.dev.yml up --build -d
```

### Clean Everything
```bash
# Stop and remove containers
docker-compose -f docker-compose.dev.yml down

# Stop, remove containers, volumes, and images
docker-compose -f docker-compose.dev.yml down -v --rmi all
```

---

## 📦 Tech Stack

- **Frontend**: Next.js 15.2.4 + React 19 + Tailwind + Shadcn/UI
- **Backend**: Express.js + Prisma 6.15.0
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Auth**: JWT + bcryptjs

---

## 📚 More Details

See detailed documentation in `/diary/`:
- `2025-10-23-SUMMARY.md` - Complete overview
- `2025-10-23-docker-setup-success.md` - Setup process
- `2025-10-23-codebase-analysis.md` - Codebase analysis

---

**Status**: ✅ All services running  
**Last Updated**: October 23, 2025

