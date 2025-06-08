# 🚀 Bun + React Full-Stack Template

A modern, production-ready full-stack template featuring **Bun** as both the runtime and build tool, with separate **React** frontend and **Bun API** backend applications.

## ✨ Features

- 🏃‍♂️ **Bun Runtime** - Fast JavaScript/TypeScript runtime and package manager
- ⚛️ **React 18** - Modern React with TypeScript support
- 🎨 **shadcn/ui** - Beautiful, accessible component library with Tailwind CSS
- 📡 **Separate Backend** - Dedicated Bun server with clean API architecture
- 📝 **TypeScript** - Full type safety across frontend and backend
- 🔄 **Hot Reload** - Fast development with HMR on both frontend and backend
- 📋 **Documentation Workflow** - Structured feature development with PRD/TRD/Progress tracking
- 🧹 **Eject Script** - Easy removal of example code to start fresh

## 📁 Project Structure

```
bun-react-template/
├── frontend/                 # React application (Port 3000)
│   ├── src/
│   │   ├── components/       # React components
│   │   │   └── ui/          # shadcn/ui components
│   │   ├── lib/             # Utility functions
│   │   ├── hooks/           # Custom React hooks
│   │   └── types/           # TypeScript interfaces
│   ├── package.json
│   └── ...
├── backend/                  # Bun API server (Port 3001)
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── services/        # Business logic
│   │   ├── types/           # TypeScript interfaces
│   │   └── utils/           # Utility functions
│   ├── index.ts             # Main server file
│   ├── package.json
│   └── ...
├── scripts/                  # Helper scripts
│   └── eject-example.js     # Remove example code
├── docs/                     # Feature documentation (PRD/TRD/Progress)
├── package.json             # Root package with dev scripts
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Bun** >= 1.0.0 ([Install Bun](https://bun.sh/docs/installation))

### Installation

1. **Clone or use this template:**
   ```bash
   git clone <your-repo-url>
   cd bun-react-template
   ```

2. **Install all dependencies:**
   ```bash
   bun run install:all
   ```

3. **Start development servers:**
   ```bash
   bun run dev
   ```

4. **Open your browser:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

### 🐳 Docker Installation (Alternative)

If you prefer using Docker:

1. **Prerequisites:**
   - Docker and Docker Compose installed

2. **Production deployment:**
   ```bash
   bun run docker:up:build
   ```

3. **Development with hot reload:**
   ```bash
   bun run docker:dev:build
   ```

4. **Stop containers:**
   ```bash
   bun run docker:down
   ```

## ⚙️ Environment Configuration

This template uses environment variables for flexible configuration across different deployment environments.

### 🔧 Setup Environment Variables

Both frontend and backend include `.env.template` files with all available configuration options.

#### Backend Configuration

1. **Copy the template:**
   ```bash
   cp backend/.env.template backend/.env
   ```

2. **Edit the variables:**
   ```bash
   # backend/.env
   PORT=3001
   NODE_ENV=development
   DATA_DIR=./data
   CORS_ORIGINS=*
   SERVICE_NAME="Book Library API"
   LOG_LEVEL=info
   ```

#### Frontend Configuration

1. **Copy the template:**
   ```bash
   cp frontend/.env.template frontend/.env
   ```

2. **Edit the variables:**
   ```bash
   # frontend/.env
   API_BASE_URL=http://localhost:3001/api
   NODE_ENV=development
   PUBLIC_URL=/
   ```

### 🐳 Docker Environment Variables

The `docker-compose.yml` automatically configures environment variables:

- **Production containers**: Use optimized settings with proper service-to-service communication
- **Development containers**: Include additional debugging and hot-reload configuration

**Important:** In Docker, the frontend uses `http://backend:3001/api` for container-to-container communication, while local development uses `http://localhost:3001/api`.

#### ⚠️ Docker Port Compatibility Notes

1. **Port Configuration**: If you change the backend `PORT` environment variable from `3001`, you must also:
   - Update the port mapping in `docker-compose.yml` (e.g., `"3002:3002"`)
   - Update the `API_BASE_URL` environment variable for the frontend service (e.g., `http://backend:3002/api`)
   - The health check will automatically adapt to the new port

2. **EXPOSE Instructions**: The `EXPOSE` instructions in Dockerfiles are documentation only and default to port `3001`. The actual ports are controlled by environment variables.

### 🌍 Environment Variable Reference

#### Backend Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `DATA_DIR` | `./data` | Data storage directory |
| `CORS_ORIGINS` | `*` | Allowed CORS origins (comma-separated) |
| `SERVICE_NAME` | `"Book Library API"` | Service identifier |
| `LOG_LEVEL` | `info` | Logging level |

#### Frontend Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `API_BASE_URL` | `http://localhost:3001/api` | Backend API endpoint |
| `NODE_ENV` | `development` | Environment mode |
| `PUBLIC_URL` | `/` | Base URL for static assets |

## 📋 Available Scripts

### Root Level Scripts
```bash
# Development
bun run dev              # Start both frontend and backend
bun run dev:frontend     # Start only frontend
bun run dev:backend      # Start only backend

# Installation
bun run install:all      # Install dependencies for all apps

# Build
bun run build           # Build both applications
bun run build:frontend  # Build only frontend
bun run build:backend   # Build only backend

# Production
bun run start           # Start backend in production
bun run start:frontend  # Start frontend preview

# Docker Commands
bun run docker:build          # Build Docker images
bun run docker:up             # Start production containers
bun run docker:up:build       # Build and start production containers
bun run docker:down           # Stop and remove containers
bun run docker:dev            # Start development containers with hot reload
bun run docker:dev:build      # Build and start development containers
bun run docker:logs           # View container logs
bun run docker:clean          # Clean up containers and images

# Utilities
bun run clean           # Clean all node_modules and dist folders
bun run eject:example   # Remove book library example
```

## 🔧 Development Workflow

This template includes a structured approach to feature development using **Product Requirements Documents (PRD)**, **Technical Requirements Documents (TRD)**, and **Progress tracking**.

### 📝 Feature Development Process

When building a new feature, follow this workflow:

#### 1. Create Documentation Files

**Product Requirements Document (PRD):**
```bash
# Create: PRD_{featureName}.md
```

Structure:
```markdown
# 📋 PRD: {Feature Name}

## 🎯 Objective
Brief description of what the feature aims to achieve

## 👥 Target Users
Who will use this feature

## ✨ Key Features
- Feature point 1
- Feature point 2

## 🔄 User Stories
- As a [user type], I want [goal] so that [benefit]

## 📊 Success Metrics
How we'll measure success

## 🚫 Out of Scope
What this feature will NOT include

## 📅 Timeline
Expected delivery dates and milestones
```

**Technical Requirements Document (TRD):**
```bash
# Create: TRD_{featureName}.md
```

Structure:
```markdown
# ⚙️ TRD: {Feature Name}

## 🏗️ Architecture Overview
High-level technical approach

## 🔧 Technical Requirements
### Frontend
- Component structure
- State management approach

### Backend
- API endpoints needed
- Data models

## 📁 File Structure
```
src/
├── components/{feature}/
├── hooks/{feature}/
└── types/{feature}/
```

## 🔒 Security Considerations
## 🧪 Testing Strategy
## 📦 Dependencies
```

**Progress Tracking:**
```bash
# Create: PROGRESS_{featureName}.md
```

Structure:
```markdown
# 📈 Progress: {Feature Name}

## 📋 Development Checklist

### 📝 Planning
- ✅ PRD Created
- ✅ TRD Created  
- 🔄 Design mockups
- ❌ Stakeholder approval

### 💻 Development
- ❌ Frontend components
- ❌ Backend APIs
- ❌ Integration tests

### 🧪 Testing
- ❌ Unit tests written
- ❌ Manual testing

### 🚀 Deployment
- ❌ Production deployment

## 🐛 Known Issues
## 📝 Notes
## 📅 Timeline Updates
```

#### 2. Status Emoji Legend
- ✅ **Complete** - Fully implemented and tested
- 🔄 **In Progress** - Currently being worked on
- ❌ **Not Started** - Not yet begun
- ⚠️ **Blocked** - Waiting on dependencies
- 🔍 **Under Review** - Pending review/approval

#### 3. Maintain Master Progress

Create and maintain a `PROJECT_PROGRESS.md` file:

```markdown
# 🚀 Project Progress Dashboard

## 🎯 Active Features
| Feature | Status | Progress | Last Updated |
|---|-----|----|----|
| User Auth | 🔄 In Progress | 60% | 2024-01-15 |

## 📊 Overall Progress
- ✅ **Completed Features:** 3
- 🔄 **In Progress:** 2  
- ❌ **Pending:** 5

## 🔗 Quick Links
- [All PRDs](docs/prds/)
- [All TRDs](docs/trds/)
- [All Progress](docs/progress/)
```

### 📂 Local Context Documentation

Create `readme.ai.md` files in relevant directories:

```markdown
# 🔐 {Component/Feature} Directory

## 📍 Context
Brief description of what this directory contains

## 🧩 Components/Files
- `ComponentA.tsx` - Description
- `ServiceB.ts` - Description

## 🔗 Related Files
- [Related Component](../path/to/component)
- [Related Service](../path/to/service)

## 💡 Key Decisions
- Important architectural decisions
- Patterns used

## 🚨 Important Notes
- Things to remember when working in this area
```

## 🧹 Starting Fresh (Ejecting the Example)

This template comes with a **Book Library** example to demonstrate the full-stack capabilities. When you're ready to start your own project:

```bash
bun run eject:example
```

This will:
- ✅ Remove all Book Library related files
- ✅ Reset `backend/index.ts` to a basic server template
- ✅ Reset `frontend/src/App.tsx` to a starter template
- ✅ Clean up unused dependencies
- ✅ Remove empty directories

After ejection, you'll have a clean template ready for your project!

## 🏗️ Architecture Overview

### Frontend (React + Bun)
- **Port:** 3000
- **Build Tool:** Bun's native bundler
- **UI Framework:** React 18 with TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **State Management:** React hooks (useState, useEffect, custom hooks)
- **API Communication:** Fetch API with custom hooks

### Backend (Bun Server)
- **Port:** 3001
- **Runtime:** Bun native server
- **Routing:** Bun's built-in routing system
- **CORS:** Enabled for development
- **Data Storage:** JSON files (easily replaceable with databases)
- **File Operations:** Bun's native file system APIs

### Key Design Decisions

1. **Separate Applications:** Frontend and backend are completely separate applications, making deployment and scaling easier.

2. **Bun-First:** Leverages Bun's capabilities throughout the stack - runtime, package manager, bundler, and server.

3. **Type Safety:** Shared TypeScript interfaces between frontend and backend for consistency.

4. **Component-Based:** Frontend uses shadcn/ui for consistent, accessible components.

5. **Documentation-Driven:** Built-in workflow for documenting features and tracking progress.

## 🔧 Customization

### Adding New shadcn/ui Components

```bash
cd frontend
bunx shadcn-ui@latest add [component-name]
```

### Backend Configuration

Edit `backend/index.ts` to:
- Add new API routes
- Configure different ports
- Add middleware
- Set up database connections

### Frontend Configuration

Edit `frontend/src/App.tsx` and related files to:
- Add new pages/components
- Configure routing
- Add state management
- Integrate with backend APIs

## 📚 Example: Book Library

The template includes a complete **Book Library** example demonstrating:

- ✅ **CRUD Operations** - Create, Read, Update, Delete books
- ✅ **Search & Filtering** - Find books by title, author, genre
- ✅ **Form Handling** - Complex forms with validation
- ✅ **State Management** - Custom hooks for API communication
- ✅ **UI Components** - Cards, forms, buttons, inputs
- ✅ **Data Persistence** - JSON file storage
- ✅ **Error Handling** - User-friendly error messages
- ✅ **Responsive Design** - Works on all screen sizes

### API Endpoints (Example)
```
GET    /api/health           # Health check
GET    /api/books            # Get all books (with filters)
POST   /api/books            # Create new book
GET    /api/books/:id        # Get specific book
PUT    /api/books/:id        # Update book
DELETE /api/books/:id        # Delete book
```

## 🚀 Deployment

### Native Deployment

#### Frontend Deployment
```bash
cd frontend
bun run build
# Deploy dist/ folder to your hosting service
```

#### Backend Deployment
```bash
cd backend
bun build index.ts --outdir dist
# Deploy and run: bun dist/index.js
```

### 🐳 Docker Deployment

#### Production Deployment
```bash
# Build and start production containers
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

#### Development Deployment
```bash
# Start development containers with hot reload
docker-compose --profile dev up --build

# Stop development containers
docker-compose --profile dev down
```

#### Docker Commands Reference
```bash
# Production
docker-compose up -d                    # Start in background
docker-compose up --build              # Rebuild and start
docker-compose logs -f                  # Follow logs
docker-compose down                     # Stop containers

# Development
docker-compose --profile dev up         # Start dev containers
docker-compose --profile dev up --build # Rebuild and start dev
docker-compose --profile dev down       # Stop dev containers

# Cleanup
docker-compose down -v --rmi all        # Remove everything
docker system prune -a                  # Clean Docker system
```

### Environment Variables

#### For Native Deployment
Create `.env` files in both frontend and backend directories:

**Backend (.env):**
```
PORT=3001
NODE_ENV=production
DATA_DIR=./data
```

**Frontend (.env):**
```
VITE_API_URL=https://your-api-domain.com
```

#### For Docker Deployment
Environment variables are configured in `docker-compose.yml`. You can override them by creating a `.env` file in the root directory:

```
# .env (root directory)
VITE_API_URL=http://localhost:3001
NODE_ENV=production
PORT=3001
```

### Data Persistence

#### Native Deployment
- Books are stored in `backend/data/books.json`
- Ensure the `data` directory has write permissions

#### Docker Deployment
- Data is persisted using Docker volumes
- Production data: `backend_data` volume
- Development data: `backend_data_dev` volume
- Data survives container restarts and rebuilds

## 🤝 Contributing

1. Follow the feature development workflow (PRD → TRD → Progress)
2. Use TypeScript throughout
3. Follow the existing code style
4. Add tests for new features
5. Update documentation

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- [Bun](https://bun.sh) - The incredibly fast JavaScript runtime
- [React](https://react.dev) - The frontend framework
- [shadcn/ui](https://ui.shadcn.com) - Beautiful component library
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework

---

**Ready to build something amazing?** 🚀

Start by exploring the Book Library example, then run `bun run eject:example` when you're ready to build your own application! 