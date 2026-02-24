# Use an official Node runtime as the base image
FROM node:20-slim AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
COPY pnpm-lock.yaml* ./

# Prefer pnpm if available
RUN if [ -f pnpm-lock.yaml ]; then \
      npm install -g pnpm && pnpm install --frozen-lockfile; \
    else \
      # use regular install rather than ci to avoid lockfile mismatches
      npm install; \
    fi

# Copy source files
COPY . .

# Build the Next.js application
RUN npm run build

# Production image
FROM node:20-slim AS runtime
WORKDIR /app

# Copy built assets and production dependencies only
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
