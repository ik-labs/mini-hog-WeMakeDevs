# Use Node.js 20 Alpine for smaller image
FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

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

# Production image
FROM node:20-alpine

WORKDIR /app

# Copy built application
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

# Create data directory for database (will be populated at startup)
RUN mkdir -p /app/data && chmod 777 /app/data

# Expose port
EXPOSE 8080

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

# Create startup script
COPY --from=builder /app/scripts/seed-direct.js ./scripts/seed-direct.js

# Start application (seed first, then start server)
CMD sh -c "cd apps/api && node ../../scripts/seed-direct.js && node dist/main.js"
