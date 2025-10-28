# Codebase Analysis - October 23, 2025

## Project Structure
Syrian Martyrs Memorial - A microservices-based platform to honor Syrian martyrs.

### Architecture
- **Monorepo** with workspaces (web, api, shared)
- **Frontend**: Next.js 15 with React 19, TypeScript, Tailwind, Shadcn/UI
- **Backend**: Express.js API with Prisma ORM
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Containerization**: Docker & Docker Compose

## API Endpoints

### Next.js API Routes (Frontend - `/app/api`)
1. **Health Check**
   - `GET /api/health` - Service health status

2. **Admin Routes** (`/api/admin`)
   - `GET /api/admin/stats` - Admin statistics
   - `GET /api/admin/users` - List all users (with pagination, filters)
   - `GET /api/admin/users/[id]` - Get/Update specific user
   - `GET /api/admin/martyrs` - List all martyrs (with verification status)
   - `POST /api/admin/martyrs/[id]/verify` - Verify martyr
   - `GET /api/admin/contributions` - List all contributions
   - `GET /api/admin/contributions-simple` - Simplified contributions list
   - `GET /api/admin/martyr-additions` - List martyr additions
   - `POST /api/admin/contributions/[id]/approve` - Approve contribution
   - `POST /api/admin/contributions/[id]/reject` - Reject contribution
   - `GET /api/admin/contributions/[id]/review` - Review contribution

3. **Contributions**
   - `GET /api/contributions?userId=xxx` - Get user contributions (MARTYR_ADDITION, TESTIMONIAL_ADDITION)

### Express API Service (`/api/server.ts`)
Separate Express.js backend with routes for:
- `/api/health` - Health check
- `/api/contributions` - Contribution management
- `/api/admin` - Admin operations

## Key Features
- JWT-based authentication
- Role-based access control (RBAC)
- Email verification system
- User profiles & contributions
- Martyr profiles with testimonials
- Admin approval workflow
- Notification system

## Technology Stack
- **Frontend**: Next.js 15.2.4, React 19, TypeScript
- **UI Components**: Shadcn/UI, Radix UI, Lucide icons
- **Backend**: Express.js, Prisma 6.15.0
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Authentication**: JWT, bcryptjs
- **Validation**: Zod
- **Dev Tools**: tsx, Docker Compose

## Docker Configuration
- `docker-compose.yml` - Production setup with profiles
- `docker-compose.dev.yml` - Development setup with hot reload
- Services: postgres, redis, api-dev, web-dev

## Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection
- `NEXTAUTH_SECRET` - JWT secret
- `NEXTAUTH_URL` - Frontend URL
- `REQUIRE_EMAIL_VERIFICATION` - Email verification toggle
- `REDIS_URL` - Redis connection (for Express API)
- `JWT_SECRET` - JWT signing secret (for Express API)
- `FRONTEND_URL` - CORS configuration

## Next Steps
- Check if .env file exists ✅
- Run Docker development environment ❌
- Test API endpoints

## Issues Found
1. **Docker Build Failure**: The web and api services don't have their own package-lock.json files
   - This is a monorepo/workspace setup
   - Each service (web/api) has package.json but no lock file
   - Docker expects lock files to be present in each service directory
   
2. **Solution**: Either:
   - Generate lock files for each workspace (cd web && npm install)
   - Modify Dockerfiles to handle workspace setup differently
   - Use the pnpm workspace approach properly

3. **Alternative**: Run services locally without Docker first to test

