# Study Strata

> AI-Powered Academic Planning Platform

## Project Structure

```
study-strata/
├── frontend/          # React + Vite frontend
│   ├── src/           # React source code
│   └── public/        # Static assets
├── backend/           # Python/Node.js backend
│   ├── src/           # API source code
│   └── prisma/        # Database schema
├── docker/            # Docker configuration
│   ├── backend/       # Backend Dockerfile
│   ├── frontend/      # Frontend Dockerfile
│   └── nginx/         # Web server config
└── tests/             # Test suites
```

## Local Development

### Frontend (React + Vite)

**Requirements:**
- Node.js 18+
- npm 9+

**Setup:**
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
# http://localhost:3000
```

### Backend (Python/Node.js)

**Requirements:**
- Python 3.10+
- Node.js 18+
- PostgreSQL
- Redis

**Setup:**
```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# Install Node dependencies
cd backend && npm install

# Start backend server
npm run dev
```

## Docker Development

```bash
# Start development environment
./docker/scripts/compose.sh dev up

# View logs
./docker/scripts/compose.sh dev logs

# Stop services
./docker/scripts/compose.sh dev down
```

## Production Build

```bash
# Build frontend
npm run build

# Start production stack
./docker/scripts/compose.sh prod up -d
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Python (FastAPI), Node.js, Express
- **AI**: OpenAI GPT-4, custom scheduling algorithms
- **Database**: PostgreSQL, Redis
- **Infra**: Docker, Nginx, GitHub Actions

## Environment Variables

Create a `.env` file in the project root:

```
# Database
DB_USER=postgres
DB_PASSWORD=your-password
DB_NAME=study_strata

# JWT
JWT_SECRET=your-secret-key

# OpenAI
OPENAI_API_KEY=your-api-key
```

## Contributing

1. Create a feature branch
2. Commit your changes
3. Open a pull request

```bash
# Run all tests
npm run test

# Backend tests with coverage
cd backend && npm run test:coverage

# Frontend tests
cd frontend && npm run test:coverage

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

## 🔧 API Documentation

### Authentication
```bash
# Register new user
POST /api/auth/register
{
  "email": "student@ucla.edu",
  "password": "securepassword",
  "name": "John Doe"
}

# Login
POST /api/auth/login
{
  "email": "student@ucla.edu",
  "password": "securepassword"
}
```

### Schedule Generation
```bash
# Generate optimized schedule
POST /api/schedule/generate
Authorization: Bearer <jwt_token>
{
  "studentProfile": { ... },
  "availableCourses": [ ... ],
  "constraints": { ... },
  "targetQuarters": 12
}
```

### AI Advisor
```bash
# Ask academic question
POST /api/advisor/query
Authorization: Bearer <jwt_token>
{
  "question": "What courses should I take next quarter?",
  "type": "course-recommendation",
  "context": { ... }
}
```

## 🚀 Deployment

### Docker Deployment
```bash
# Production build
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose up -d --scale backend=3
```

### AWS ECS Deployment
```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Maintain 90%+ test coverage
- Use conventional commits
- Update documentation for new features

---

**Built with ❤️ for UCLA students by students**
