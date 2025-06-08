# Use the official Bun image as base
FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies into temp directory
# This will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock* /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# Install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lock* /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# Copy node_modules from temp directory
# Then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# [optional] tests & build
ENV NODE_ENV=production
# Skip tests and build for simple Bun server - runs TypeScript directly

# Copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /app/index.ts .
COPY --from=prerelease /app/src ./src
COPY --from=prerelease /app/package.json .
COPY --from=prerelease /app/books.json ./books.json

# Create data directory for persistent storage and set permissions
RUN mkdir -p /app/data && chown -R bun:bun /app/data

# Expose the port that your app runs on
# Note: This is the default port, actual port is controlled by PORT environment variable
EXPOSE 3001

# Set the user to bun for security
USER bun

# Run the app
ENTRYPOINT [ "bun", "run", "index.ts" ] 