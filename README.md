# Syrian Martyrs Memorial

A platform to honor and remember Syrian martyrs, built with a microservices architecture.

## 🏗️ Architecture

This project is structured as a microservices application with two main services:

- **Web Service** (`/web`): Next.js frontend application
- **API Service** (`/api`): Express.js backend API
- **Shared** (`/shared`): Common types and utilities

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (or use Docker)

### Development Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd syrian-martyrs-memorial
   npm run install:all
   ```

2. **Start development services:**
   ```bash
   # Using Docker (recommended)
   npm run docker:dev
   
   # Or run services separately
   npm run dev
   ```

3. **Access the applications:**
   - Web Frontend: http://localhost:3000
   - API Backend: http://localhost:3001
   - Database: localhost:5432

### Production Setup

```bash
# Build and start production services
npm run docker:prod
```

## 📁 Project Structure

```
syrian-martyrs-memorial/
├── web/                    # Frontend Next.js App
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   ├── lib/              # Frontend utilities
│   ├── public/           # Static assets
│   ├── styles/           # CSS files
│   ├── package.json      # Frontend dependencies
│   └── Dockerfile        # Frontend container
│
├── api/                  # Backend API Service
│   ├── src/
│   │   ├── routes/       # API route handlers
│   │   ├── controllers/  # Business logic
│   │   ├── services/    # Service layer
│   │   ├── middleware/  # Auth, validation, etc.
│   │   └── utils/       # Backend utilities
│   ├── prisma/          # Database schema & migrations
│   ├── lib/             # Shared backend utilities
│   ├── package.json     # Backend dependencies
│   └── Dockerfile       # Backend container
│
├── shared/              # Shared code between services
│   ├── types/           # TypeScript types
│   ├── utils/           # Shared utilities
│   └── constants/       # Shared constants
│
├── docker-compose.yml     # Multi-service orchestration
├── docker-compose.dev.yml # Development overrides
└── package.json          # Root package management
```

## 🛠️ Development

### Available Scripts

#### Root Level
- `npm run dev` - Start both web and API in development
- `npm run build` - Build both services
- `npm run docker:dev` - Start development with Docker
- `npm run docker:prod` - Start production with Docker

#### Web Service
- `cd web && npm run dev` - Start web development server
- `cd web && npm run build` - Build web application
- `cd web && npm run start` - Start web production server

#### API Service
- `cd api && npm run dev` - Start API development server
- `cd api && npm run build` - Build API application
- `cd api && npm run start` - Start API production server

### Database Management

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Push schema changes
npm run db:push

# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

## 🐳 Docker

### Development
```bash
# Start all services with hot reload
docker-compose -f docker-compose.dev.yml up --build

# Start specific services
docker-compose -f docker-compose.dev.yml up web-dev api-dev postgres redis
```

### Production
```bash
# Start production services
docker-compose --profile production up --build

# Stop all services
docker-compose down

# Clean up (remove volumes and images)
docker-compose down -v --rmi all
```

## 🔧 Configuration

### Environment Variables

#### Web Service
- `NEXT_PUBLIC_API_URL` - API service URL (default: http://localhost:3001)

#### API Service
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - JWT signing secret
- `FRONTEND_URL` - Frontend service URL for CORS

### Database
- PostgreSQL 15
- Redis 7 (for caching and sessions)

## 📡 API Endpoints

### Health Check
- `GET /api/health` - Service health status

### Contributions
- `GET /api/contributions` - Get user contributions
- `POST /api/contributions` - Create new contribution

### Admin
- `GET /api/admin/stats` - Get admin statistics
- `GET /api/admin/contributions` - Get all contributions
- `GET /api/admin/users` - Get all users
- `GET /api/admin/martyrs` - Get all martyrs

## 🔐 Authentication

The API uses JWT-based authentication. Include the token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

## 🧪 Testing

```bash
# Run API tests
npm run test:api

# Run all tests
npm run test
```

## 📦 Deployment

### Docker Deployment
1. Build production images:
   ```bash
   docker-compose --profile production build
   ```

2. Start production services:
   ```bash
   docker-compose --profile production up -d
   ```

### Manual Deployment
1. Build both services:
   ```bash
   npm run build
   ```

2. Start services:
   ```bash
   npm run start
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.