#!/bin/bash

# Syrian Martyrs Memorial - Database Setup Script
# This script automates the database setup process

set -e

echo "🚀 Starting Syrian Martyrs Memorial Database Setup..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from example..."
    if [ -f env.example ]; then
        cp env.example .env
        echo "✅ Created .env file from env.example"
        echo "📝 Please edit .env file with your database credentials before continuing"
        echo "Press Enter when ready to continue..."
        read
    else
        echo "❌ env.example not found. Please create .env file manually."
        exit 1
    fi
fi

echo "🐳 Starting PostgreSQL database..."
docker-compose -f docker-compose.db.yml up -d

echo "⏳ Waiting for database to be ready..."
sleep 10

# Check if database is ready
until docker-compose -f docker-compose.db.yml exec -T postgres pg_isready -U postgres; do
    echo "⏳ Database not ready yet, waiting..."
    sleep 2
done

echo "✅ Database is ready!"

echo "🔧 Setting up Prisma..."
pnpm db:generate

echo "📊 Pushing database schema..."
pnpm db:push

echo "🌱 Seeding database with initial data..."
pnpm db:seed

echo "🎉 Database setup completed successfully!"
echo ""
echo "📊 Database is running on:"
echo "   - PostgreSQL: localhost:51213"
echo "   - pgAdmin: http://localhost:9080 (admin@syrianmartyrs.com / admin)"
echo ""
echo "🔧 Useful commands:"
echo "   - View database: pnpm db:studio"
echo "   - Reset database: docker-compose -f docker-compose.db.yml down -v && pnpm docker:db"
echo "   - View logs: docker-compose -f docker-compose.db.yml logs -f"
echo ""
echo "🚀 You can now start the development server with: pnpm dev"
