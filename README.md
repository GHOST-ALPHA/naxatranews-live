# naxatra - News Platform


pnpm migrate:old-news -- --limit=5000



A modern news platform built with Next.js, PostgreSQL, and Docker.

## 🚀 Quick Start

### Development
```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Fill in your environment variables

# Run database migrations
pnpm run db:push

# Seed database
pnpm run db:seed

# Start development server
pnpm dev
```

## 📦 Production Deployment

### Digital Ocean Deployment

**First time deploying?** Start here:
- **[Quick Start Guide](./docs/QUICK_START.md)** - Get live in 15 minutes ⚡
- **[Complete Deployment Guide](./docs/DIGITAL_OCEAN_DEPLOYMENT.md)** - Detailed step-by-step walkthrough 📚
- **[Deployment Checklist](./docs/DEPLOYMENT_CHECKLIST.md)** - Ensure nothing is missed ✅

**Already deployed?**
- **[Deployment Summary](./docs/DEPLOYMENT_SUMMARY.md)** - Architecture and reference 📋

### Docker Deployment

```bash
# Build and start
docker compose up -d --build

# Run migrations
docker compose exec app pnpm exec prisma migrate deploy

# Seed database
docker compose exec app pnpm run db:seed
```

### Environment Variables

See **[env.production.template](./env.production.template)** for all required environment variables.

## 📚 Documentation

- **[Architecture Overview](./docs/ARCHITECTURE_OVERVIEW.md)**
- **[Module Development Guide](./docs/MODULE_DEVELOPMENT_GUIDE.md)**
- **[Production Deployment](./docs/DIGITAL_OCEAN_DEPLOYMENT.md)**
- **[Deployment Checklist](./docs/DEPLOYMENT_CHECKLIST.md)**

## 🛠️ Tech Stack

- **Framework**: Next.js 16
- **Database**: PostgreSQL (Prisma ORM)
- **Authentication**: NextAuth.js + JWT
- **Containerization**: Docker & Docker Compose
- **Package Manager**: pnpm

## 📝 License

Alpha
