# Use the official Bun image as base
FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Set production environment
ENV NODE_ENV=production

# Expose the port
EXPOSE 3000

# Set the user to bun for security
USER bun

# Run the server directly (no build step - reads env vars at runtime)
CMD ["bun", "src/index.tsx"] 