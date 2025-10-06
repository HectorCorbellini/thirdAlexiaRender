# =============================================================================
# Backend Dockerfile - Multi-stage build for ALEXIA Platform
# =============================================================================

# Stage 1: Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and prisma schema
COPY package.json ./
COPY prisma ./prisma

# Install pnpm
RUN npm install -g pnpm

# Install dependencies (this will run prisma generate via postinstall)
RUN pnpm install

# Copy source code
COPY . .

# Build TypeScript
RUN pnpm build

# =============================================================================
# Stage 2: Production stage
FROM node:18-alpine AS production

# Install OpenSSL for Prisma and netcat for database wait
RUN apk add --no-cache openssl netcat-openbsd

WORKDIR /app

# Copy built application, node_modules, and prisma from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use entrypoint script
ENTRYPOINT ["docker-entrypoint.sh"]
