# Stage 1: Build
FROM oven/bun:1.3.13-alpine AS builder

WORKDIR /app

# Copy configuration and lock files
COPY package.json bun.lock ./
COPY tsconfig.json astro.config.mjs tailwind.config.cjs svelte.config.js postcss.config.mjs biome.json ./

# Install dependencies
RUN bun install --frozen-lockfile

# Set environment variables for build
ENV NODE_ENV=production

# Copy source code and scripts
COPY src ./src
COPY public ./public
COPY scripts ./scripts

# Build the application
RUN bun run build:prod

# Stage 2: Runtime
FROM oven/bun:1.3.13-alpine AS runner

WORKDIR /app

# Copy the built server file and rearranged static assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/scripts/healthcheck.sh ./scripts/healthcheck.sh
COPY --from=builder /app/src/redirects.txt ./src/redirects.txt

# Set environment variables
ENV NODE_ENV=production
ENV PORT=80

ARG COMMIT_HASH
ENV APP_COMMIT_HASH=${COMMIT_HASH}

# Health check
HEALTHCHECK --interval=60s --timeout=5s --start-period=5s --retries=5 \
  CMD ["/app/scripts/healthcheck.sh"]

# Expose the port
EXPOSE 80

# Run the standalone binary
CMD ["bun", "/app/dist/server.js"]
