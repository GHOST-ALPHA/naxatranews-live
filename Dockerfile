# Stage 1: Dependencies
FROM node:20-slim AS deps
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Stage 2: Builder
FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Install OpenSSL for Prisma generation
RUN apt-get update -y && apt-get install -y openssl

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js application
ARG NEXT_PUBLIC_LIVE_TV_URL
ARG NEXT_PUBLIC_LIVE_TV_ENABLED
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ARG NEXT_PUBLIC_GA4_ID
ARG NEXT_PUBLIC_GTM_ID
ARG NEXT_PUBLIC_ADSENSE_CLIENT

ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production \
    DATABASE_URL="postgresql://user:password@localhost:5432/db?schema=public" \
    JWT_SECRET="dummy_jwt_secret_at_least_32_chars_long__" \
    NEXT_PUBLIC_LIVE_TV_URL=$NEXT_PUBLIC_LIVE_TV_URL \
    NEXT_PUBLIC_LIVE_TV_ENABLED=$NEXT_PUBLIC_LIVE_TV_ENABLED \
    NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL \
    NEXT_PUBLIC_GA_MEASUREMENT_ID=$NEXT_PUBLIC_GA_MEASUREMENT_ID \
    NEXT_PUBLIC_GA4_ID=$NEXT_PUBLIC_GA4_ID \
    NEXT_PUBLIC_GTM_ID=$NEXT_PUBLIC_GTM_ID \
    NEXT_PUBLIC_ADSENSE_CLIENT=$NEXT_PUBLIC_ADSENSE_CLIENT

RUN npm run build

# Stage 3: Runner
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=4141
ENV HOSTNAME="0.0.0.0"

# Install OpenSSL for Prisma (Debian Slim needs this)
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 nextjs

# Copy standalone build artifacts
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

# Copy Prisma client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Setup permissions for media storage
RUN mkdir -p public/storage/media/uploads public/storage/thumbnails && \
    chown -R nextjs:nodejs /app && \
    chmod -R 755 /app/public/storage

USER nextjs

EXPOSE 4141

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4141/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]
