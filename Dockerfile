# Stage 1: Dependencies
FROM node:20 AS deps
WORKDIR /app

# Install dependencies (including dev dependencies for build)
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Stage 2: Builder
FROM node:20 AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js application with standalone output
# NOTE: We set safe dummy env values here ONLY for the build,
# real secrets are provided at runtime via docker-compose.
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production \
    DATABASE_URL="postgresql://user:password@localhost:5432/db?schema=public" \
    JWT_SECRET="dummy_jwt_secret_at_least_32_chars_long__"

RUN npm run build

# Stage 3: Runner
FROM node:20 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install production dependencies and Prisma CLI for migrations
COPY package.json package-lock.json ./
RUN npm ci --only=production --ignore-scripts && \
    npm install prisma --save-dev --ignore-scripts



# Create non-root user for security
RUN groupadd -r nodejs && useradd -r -g nodejs nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

# Copy Prisma client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Create storage directories with proper permissions
RUN mkdir -p public/storage/media/uploads && \
    mkdir -p public/storage/thumbnails && \
    chown -R nextjs:nodejs /app && \
    chmod -R 755 /app/public/storage

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 4141

ENV PORT=4141
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4141/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "server.js"]
