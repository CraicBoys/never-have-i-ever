# 🐳 Docker Usage Guide

This project now uses separate Docker Compose files for different environments instead of profiles.

## 🚀 Production

To run the production environment:

```bash
# Build and start production services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

**Services:**
- Frontend: http://localhost:3000 (built & optimized)
- Backend: http://localhost:3001 (production mode)

## 🛠️ Development

To run the development environment:

```bash
# Build and start development services
docker compose -f docker-compose.dev.yml up -d

# View logs
docker compose -f docker-compose.dev.yml logs -f

# Stop services
docker compose -f docker-compose.dev.yml down
```

**Services:**
- Frontend: http://localhost:3000 (hot reload enabled)
- Backend: http://localhost:3001 (development mode with file watching)

## 🔄 Switching Between Environments

Make sure to stop one environment before starting another:

```bash
# Stop production
docker compose down

# Start development
docker compose -f docker-compose.dev.yml up -d
```

## 🏗️ Building Only

If you want to build without starting:

```bash
# Production build
docker compose build

# Development build
docker compose -f docker-compose.dev.yml build
```

## 📁 File Structure

```
├── docker-compose.yml          # Production environment
├── docker-compose.dev.yml      # Development environment
├── backend/
│   ├── Dockerfile              # Production backend
│   └── Dockerfile.dev          # Development backend
└── frontend/
    ├── Dockerfile              # Production frontend
    └── Dockerfile.dev          # Development frontend
```

## 🔧 Environment Variables

Both environments support these key variables:

- `API_BASE_URL`: Base URL for API calls (automatically configured)
- `NODE_ENV`: Set to `production` or `development`
- `PORT`: Backend port (default: 3001)

## 💡 Tips

- Use development for coding with hot reload
- Use production for final testing and deployment
- Both environments persist data in separate volumes
- Development mounts source code for live editing 