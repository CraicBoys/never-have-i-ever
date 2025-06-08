# Use the official Bun image as base
FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies into temp directory
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

# Set production environment and API_BASE_URL for environment variable inlining
ENV NODE_ENV=production
ARG API_BASE_URL=http://localhost:3001/api
ENV API_BASE_URL=$API_BASE_URL

# Copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /app/src ./src
COPY --from=prerelease /app/package.json .

# Set production environment for runtime
ENV NODE_ENV=production

# Expose the port
EXPOSE 3000

# Set the user to bun for security
USER bun

# Run the frontend server
CMD ["bun", "src/index.tsx"] 