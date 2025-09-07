# Database Setup Guide - Syrian Martyrs Memorial

This guide will help you set up the PostgreSQL database using Prisma for the Syrian Martyrs Memorial project.

## Prerequisites

- Node.js 18+ and pnpm
- Docker and Docker Compose
- PostgreSQL 15+ (or use the provided Docker setup)

## Quick Start

### 1. Environment Setup

Create a `.env` file in the root directory:

```bash
# Database connection
DATABASE_URL="postgresql://postgres:password@localhost:5432/syrian_martyrs_db"

# Next.js environment variables
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 2. Start Database

```bash
# Start PostgreSQL and pgAdmin using Docker
pnpm docker:db

# Or manually with docker-compose
docker-compose -f docker-compose.db.yml up -d
```

This will start:
- PostgreSQL on port 51213
- pgAdmin on port 9080 (admin@syrianmartyrs.com / admin)

### 3. Database Setup

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database (for development)
pnpm db:push

# Or create and run migrations (for production)
pnpm db:migrate
```

### 4. Seed Database

```bash
# Populate with initial data
pnpm db:seed
```

### 5. View Database

```bash
# Open Prisma Studio
pnpm db:studio
```

## Database Schema

### Core Models

#### Martyr
- **id**: Unique identifier (CUID)
- **name**: Full name of the martyr
- **dateOfDeath**: Date of death
- **location**: Place of death
- **cause**: Cause of death
- **description**: Detailed description
- **image**: Image URL
- **age**: Age at death
- **gender**: Gender (MALE/FEMALE/OTHER/UNKNOWN)
- **occupation**: Profession
- **familyStatus**: Family situation
- **isVerified**: Verification status
- **createdAt/updatedAt**: Timestamps

#### User
- **id**: Unique identifier (CUID)
- **email**: Email address (unique)
- **name**: Display name
- **password**: Hashed password
- **role**: User role (ADMIN/MODERATOR/USER)
- **isVerified**: Account verification status
- **createdAt/updatedAt**: Timestamps

#### Profile
- **id**: Unique identifier (CUID)
- **userId**: Reference to User
- **bio**: Biography
- **avatar**: Profile picture URL
- **location**: User location
- **website**: Personal website
- **socialLinks**: Social media links (JSON)
- **createdAt/updatedAt**: Timestamps

#### Testimonial
- **id**: Unique identifier (CUID)
- **content**: Testimonial text
- **author**: Author name
- **relationship**: Relationship to martyr
- **date**: Testimonial date
- **isVerified**: Verification status
- **martyrId**: Reference to Martyr
- **userId**: Reference to User (if authenticated)
- **createdAt/updatedAt**: Timestamps

#### Source
- **id**: Unique identifier (CUID)
- **name**: Source name
- **url**: Source URL
- **date**: Publication date
- **type**: Source type (NEWS/REPORT/SOCIAL/OFFICIAL/OTHER)
- **martyrId**: Reference to Martyr
- **createdAt/updatedAt**: Timestamps

#### Contribution
- **id**: Unique identifier (CUID)
- **type**: Contribution type
- **status**: Status (PENDING/APPROVED/REJECTED/UNDER_REVIEW)
- **content**: Contribution data (JSON)
- **notes**: Additional notes
- **userId**: Reference to User
- **martyrId**: Reference to Martyr (optional)
- **createdAt/updatedAt**: Timestamps

### Enums

#### UserRole
- `ADMIN`: Full system access
- `MODERATOR`: Content moderation
- `USER`: Standard user

#### Gender
- `MALE`
- `FEMALE`
- `OTHER`
- `UNKNOWN`

#### SourceType
- `NEWS`: News articles
- `REPORT`: Official reports
- `SOCIAL`: Social media
- `OFFICIAL`: Government/official sources
- `OTHER`: Other sources

#### ContributionType
- `MARTYR_ADDITION`: New martyr entry
- `MARTYR_UPDATE`: Update existing martyr
- `TESTIMONIAL_ADDITION`: New testimonial
- `SOURCE_ADDITION`: New source
- `CORRECTION`: Data correction
- `OTHER`: Other contributions

#### ContributionStatus
- `PENDING`: Awaiting review
- `APPROVED`: Accepted
- `REJECTED`: Declined
- `UNDER_REVIEW`: Currently being reviewed

## Database Operations

### Common Queries

The `lib/db.ts` file provides utility functions for common database operations:

- `getMartyrsWithRelations()`: Get martyrs with testimonials and sources
- `getMartyrById()`: Get specific martyr with full details
- `searchMartyrs()`: Search martyrs by various criteria
- `createContribution()`: Submit new contribution
- `getPendingContributions()`: Get contributions awaiting review
- `createTestimonial()`: Add new testimonial
- `createSource()`: Add new source
- `getUserById()`: Get user with profile and contributions
- `getDatabaseStats()`: Get system statistics

### Example Usage

```typescript
import { getMartyrsWithRelations, createTestimonial } from '@/lib/db'

// Get all martyrs with their testimonials and sources
const martyrs = await getMartyrsWithRelations(20, 0)

// Add a new testimonial
const testimonial = await createTestimonial({
  content: "Personal memory of the martyr...",
  author: "Family Member",
  relationship: "Sister",
  martyrId: "martyr_id_here"
})
```

## Development Workflow

### 1. Schema Changes

1. Modify `prisma/schema.prisma`
2. Generate Prisma client: `pnpm db:generate`
3. Push changes: `pnpm db:push` (dev) or `pnpm db:migrate` (prod)

### 2. Data Seeding

1. Modify `prisma/seed.ts` if needed
2. Run: `pnpm db:seed`

### 3. Database Reset

```bash
# Stop database
docker-compose -f docker-compose.db.yml down -v

# Start fresh
docker-compose -f docker-compose.db.yml up -d

# Re-seed
pnpm db:seed
```

## Production Considerations

### Environment Variables

```bash
# Production database URL
DATABASE_URL="postgresql://username:password@host:port/database"

# Use strong, unique secrets
NEXTAUTH_SECRET="your-production-secret-here"
NEXTAUTH_URL="https://yourdomain.com"
```

### Database Migrations

For production, always use migrations instead of `db:push`:

```bash
# Create migration
pnpm db:migrate

# Apply migrations in production
npx prisma migrate deploy
```

### Connection Pooling

Consider using connection pooling for production:

```typescript
// In lib/db.ts
import { PrismaClient } from './generated/prisma'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pooling configuration
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})
```

## Troubleshooting

### Common Issues

1. **Connection Refused**: Ensure PostgreSQL is running
2. **Authentication Failed**: Check DATABASE_URL credentials
3. **Schema Sync Issues**: Try `pnpm db:generate` then `pnpm db:push`
4. **Seed Errors**: Check data format in `prisma/seed.ts`

### Useful Commands

```bash
# Check database status
docker-compose -f docker-compose.db.yml ps

# View database logs
docker-compose -f docker-compose.db.yml logs postgres

# Reset everything
docker-compose -f docker-compose.db.yml down -v
pnpm docker:db
pnpm db:generate
pnpm db:push
pnpm db:seed
```

## Security Notes

- Never commit `.env` files
- Use strong passwords in production
- Regularly update dependencies
- Implement proper authentication and authorization
- Validate all user inputs
- Use HTTPS in production

## Support

For database-related issues:
1. Check the Prisma documentation
2. Review the schema file
3. Check database logs
4. Verify environment variables
