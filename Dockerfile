# Use Node.js 20 Slim (Debian-based) for DuckDB native bindings
FROM node:20-slim AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY turbo.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/api/package*.json ./apps/api/

# Install ALL dependencies (including dev)
RUN npm install

# Copy source code
COPY . .

# Build only API and its dependencies (shared)
RUN npm run build -- --filter=@minihog/api

# Note: Seed data will be generated at container startup (see CMD below)

# Production image (Debian-based for glibc compatibility)
FROM node:20-slim

WORKDIR /app

# Copy built application
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/packages/shared/package.json ./packages/shared/package.json

# Create data directory for database (will be populated at startup)
RUN mkdir -p /app/data && chmod 777 /app/data

# Expose port
EXPOSE 8080

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

# Create startup script
COPY --from=builder /app/scripts/seed-direct.js ./scripts/seed-direct.js

# Start application
# Note: Seed database manually after deployment with: curl POST /api/ingest
CMD ["node", "apps/api/dist/main.js"]
