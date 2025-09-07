# Syrian Martyrs Memorial

A memorial application built with Next.js to honor and remember those who lost their lives in the Syrian conflict. The application provides a searchable database of martyr profiles with detailed information, testimonials, and sources.

## Features

- **Memorial Database**: Comprehensive profiles of Syrian martyrs with detailed information
- **Search Functionality**: Text-based search by name or location
- **Image Search**: Planned facial recognition search capability
- **Authentication**: User authentication system (currently mock implementation)
- **Responsive Design**: Mobile-first design with dark/light theme support
- **Modern UI**: Built with Tailwind CSS and shadcn/ui components

## Tech Stack

- **Framework**: Next.js 15.2.4 with React 19
- **Styling**: Tailwind CSS with custom theme
- **UI Components**: shadcn/ui with Radix UI primitives
- **Package Manager**: pnpm
- **TypeScript**: Full TypeScript support
- **Containerization**: Docker & Docker Compose

## Prerequisites

- Docker and Docker Compose installed on your system
- Git (for cloning the repository)

## Quick Start with Docker

### 1. Clone the Repository

```bash
git clone <repository-url>
cd syrian-martyrs-frontend
```

### 2. Environment Setup

```bash
# Copy the environment example file
cp .env.example .env

# Edit the .env file with your configuration (optional for basic setup)
nano .env
```

### 3. Development with Docker

#### Option A: Development with Hot Reload (Recommended)

```bash
# Start development server with hot reload
pnpm docker:dev

# Or using docker-compose directly
docker-compose --profile dev up --build
```

#### Option B: Fresh Development Environment

```bash
# Start with fresh dependencies installation
pnpm docker:dev:fresh

# Or using docker-compose directly
docker-compose --profile dev-fresh up --build
```

#### Option C: Production Build

```bash
# Start production build
pnpm docker:prod

# Or using docker-compose directly
docker-compose --profile prod up --build
```

### 4. Access the Application

- **Development**: http://localhost:3000
- **Production**: http://localhost:3000

## Available Docker Commands

```bash
# Development commands
pnpm docker:dev          # Start development server with hot reload
pnpm docker:dev:fresh    # Start with fresh dependency installation
pnpm docker:prod         # Start production build

# Management commands
pnpm docker:down         # Stop all containers
pnpm docker:clean        # Stop containers and remove images/volumes
pnpm docker:logs         # View container logs
```

## Development Without Docker

If you prefer to run the application without Docker:

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Project Structure

```
syrian-martyrs-frontend/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── header.tsx        # Header component
│   ├── hero.tsx          # Hero section
│   ├── martyrs-list.tsx  # Martyrs list component
│   └── ...
├── lib/                  # Utility libraries
│   ├── data.ts          # Mock data
│   ├── types.ts         # TypeScript types
│   └── auth-context.tsx # Authentication context
├── hooks/               # Custom React hooks
├── styles/              # Additional styles
├── public/              # Static assets
├── Dockerfile           # Production Docker image
├── Dockerfile.dev       # Development Docker image
├── docker-compose.yml   # Docker Compose configuration
└── package.json         # Dependencies and scripts
```

## Authentication

The application includes a mock authentication system with the following test credentials:

- **Admin User**: 
  - Email: `admin@example.com`
  - Password: `password`
  - Role: Admin

- **Regular User**:
  - Email: `user@example.com` 
  - Password: `password`
  - Role: User

## Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

```bash
# Application Configuration
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1

# Database Configuration (for future backend integration)
# DATABASE_URL=postgresql://username:password@localhost:5432/syrian_martyrs

# Authentication (for future backend integration)
# NEXTAUTH_SECRET=your-secret-key-here
# NEXTAUTH_URL=http://localhost:3000

# API Configuration (for future backend integration)
# API_BASE_URL=http://localhost:8000
# API_KEY=your-api-key-here
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Test your changes: `pnpm docker:dev`
5. Commit your changes: `git commit -m 'Add some feature'`
6. Push to the branch: `git push origin feature/your-feature-name`
7. Submit a pull request

## Docker Configuration Details

### Development Setup

- **Base Image**: Node.js 18 Alpine
- **Package Manager**: pnpm
- **Hot Reload**: Enabled with volume mounting
- **Port**: 3000

### Production Setup

- **Multi-stage Build**: Optimized for production
- **Standalone Output**: Next.js standalone mode for smaller images
- **Security**: Non-root user execution
- **Performance**: Optimized layer caching

### Docker Compose Profiles

- `dev`: Development with hot reload
- `dev-fresh`: Development with fresh dependency installation
- `prod`: Production build

## Troubleshooting

### Common Issues

1. **Port 3000 already in use**:
   ```bash
   # Stop existing containers
   pnpm docker:down
   
   # Or change the port in docker-compose.yml
   ```

2. **Permission issues on Linux/macOS**:
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

3. **Docker build fails**:
   ```bash
   # Clean Docker cache
   docker system prune -a
   
   # Rebuild from scratch
   pnpm docker:clean
   pnpm docker:dev
   ```

4. **Hot reload not working**:
   ```bash
   # Ensure volumes are properly mounted
   docker-compose --profile dev up --build
   ```

### Getting Help

- Check the logs: `pnpm docker:logs`
- Verify Docker is running: `docker --version`
- Check container status: `docker ps`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with Next.js and React
- UI components from shadcn/ui
- Icons from Lucide React
- Styling with Tailwind CSS