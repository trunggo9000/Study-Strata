# Docker Setup for Study Strata

This directory contains the Docker configuration for Study Strata, including development and production setups.

## Directory Structure

```
docker/
├── backend/                 # Backend service configuration
│   └── Dockerfile           # Backend service Dockerfile
├── frontend/               # Frontend service configuration
│   └── Dockerfile           # Frontend service Dockerfile
├── nginx/                  # Nginx configuration
│   └── nginx.conf           # Nginx configuration
├── compose/                # Docker Compose configurations
│   ├── dev/                # Development environment
│   │   └── docker-compose.yml
│   └── prod/               # Production environment
│       └── docker-compose.yml
└── scripts/                # Utility scripts
    └── compose.sh          # Helper script for running compose commands
```

## Development Setup

1. **Using the helper script (recommended)**:
   ```bash
   # Start development environment
   ./docker/scripts/compose.sh dev up
   
   # View logs
   ./docker/scripts/compose.sh dev logs
   
   # Stop services
   ./docker/scripts/compose.sh dev down
   ```

2. **Using Docker Compose directly**:
   ```bash
   # Start development containers
   docker-compose -f docker/compose/dev/docker-compose.yml up --build
   ```

2. **Access services**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - PostgreSQL: localhost:5433 (user: dev, password: devpassword, db: study_strata_dev)
   - Redis: localhost:6380 (password: devpassword)

## Production Setup

1. **Using the helper script**:
   ```bash
   # Start production environment
   ./docker/scripts/compose.sh prod up -d
   
   # View logs
   ./docker/scripts/compose.sh prod logs
   
   # Stop services
   ./docker/scripts/compose.sh prod down
   ```

2. **Using Docker Compose directly**:
   ```bash
   # Start production containers
   docker-compose -f docker/compose/prod/docker-compose.yml up -d
   ```

3. **Environment Variables**:
   Create a `.env` file in the project root with production variables:
   ```env
   # Database
   DB_USER=postgres
   DB_PASSWORD=your-secure-password
   DB_NAME=study_strata
   
   # Redis
   REDIS_PASSWORD=your-secure-redis-password
   
   # JWT
   JWT_SECRET=your-jwt-secret
   
   # OpenAI
   OPENAI_API_KEY=your-openai-api-key
   ```

2. **Build and start production services**:
   ```bash
   docker-compose -f docker-compose.prod.yml up --build -d
   ```

3. **Access services**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379

## Useful Commands

- **View logs**: `docker-compose -f docker-compose.dev.yml logs -f`
- **Run migrations**: `docker-compose -f docker-compose.dev.yml exec backend npm run migrate`
- **Run tests**: `docker-compose -f docker-compose.dev.yml exec backend npm test`
- **Access database**: `PGPASSWORD=devpassword psql -h localhost -p 5433 -U dev -d study_strata_dev`

## Cleanup

To stop and remove all containers, volumes, and networks:

```bash
# Development
docker-compose -f docker-compose.dev.yml down -v

# Production
docker-compose -f docker-compose.prod.yml down -v
```
