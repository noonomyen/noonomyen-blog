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
# 1. Astro static build
# 2. Rearrange dist directories
# 3. Build standalone server binary
RUN bun run build

# Stage 2: Runtime
FROM alpine:3.22.4 AS runner

WORKDIR /app

# Install runtime dependencies
COPY --from=builder /usr/lib/libstdc++.so.6 /usr/lib/libstdc++.so.6
COPY --from=builder /usr/lib/libgcc_s.so.1 /usr/lib/libgcc_s.so.1

# Copy the compiled server binary and rearranged static assets
COPY --from=builder /app/dist ./dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4321

# Expose the port
EXPOSE 4321

# Run the standalone binary
CMD ["/app/dist/server"]
