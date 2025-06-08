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

# Build the frontend for production
RUN bun run build

# Copy production dependencies and built files into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /app/dist ./dist
COPY --from=prerelease /app/package.json .

# Set production environment for runtime
ENV NODE_ENV=production

# Expose the port
EXPOSE 3000

# Set the user to bun for security
USER bun

# Serve the built static files using a simple static server
CMD ["bun", "-e", "import { serve } from 'bun'; import { readFileSync } from 'fs'; import { join } from 'path'; const server = serve({ hostname: '0.0.0.0', port: 3000, fetch(req) { const url = new URL(req.url); let filePath = url.pathname === '/' ? '/index.html' : url.pathname; try { const file = readFileSync(join('./dist', filePath)); return new Response(file, { headers: { 'Content-Type': filePath.endsWith('.html') ? 'text/html' : filePath.endsWith('.js') ? 'application/javascript' : filePath.endsWith('.css') ? 'text/css' : 'application/octet-stream' } }); } catch { return new Response('Not Found', { status: 404 }); } } }); console.log('Frontend server running on http://0.0.0.0:3000');"] 