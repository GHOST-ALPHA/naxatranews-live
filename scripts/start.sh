#!/bin/sh
# Startup script for Docker container
# Runs database migrations before starting the application

set -e

echo "🚀 Starting Naxatra application..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until npx prisma db execute --stdin <<< "SELECT 1" > /dev/null 2>&1; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "✅ Database is ready!"

# Run database migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy || {
  echo "⚠️  Migration failed, trying db push..."
  npx prisma db push --accept-data-loss || {
    echo "❌ Database setup failed!"
    exit 1
  }
}

echo "✅ Database migrations completed!"

# Seed database if needed (only on first run)
if [ "$SEED_DATABASE" = "true" ]; then
  echo "🌱 Seeding database..."
  npm run db:seed || echo "⚠️  Database seeding failed or already seeded"
fi

# Start the application
echo "🎉 Starting Next.js application..."
exec node server.js
