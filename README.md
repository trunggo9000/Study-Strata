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

## 🎯 Core Features Deep Dive

### 🤖 AI Scheduling Engine
- **Multi-Quarter Planning**: Optimizes course sequences across 4+ years
- **Weighted Scoring**: Considers prerequisites, workload, GPA impact, graduation progress
- **Conflict Resolution**: Automatically detects and resolves time/prerequisite conflicts
- **Performance**: Generates optimal schedules in <2 seconds

### 💬 Natural Language Advisor
- **GPT-4 Integration**: Contextual academic advice and course recommendations
- **What-If Analysis**: Scenario modeling for major changes, study load adjustments
- **Career Guidance**: Personalized career path recommendations
- **Performance Analytics**: GPA trends and improvement suggestions

### 📊 Interactive Roadmap
- **Timeline View**: Visual course progression with milestones
- **Grid Layout**: Quarter-by-quarter course overview
- **Progress Tracking**: Real-time graduation progress and GPA projection
- **Export Options**: PDF/CSV export for academic advisors

## 🔒 Security Features

- **JWT Authentication** with secure token rotation
- **Password Hashing** using bcrypt with salt rounds
- **Rate Limiting** to prevent API abuse
- **Input Validation** with express-validator
- **CORS Protection** for cross-origin requests
- **Helmet.js** for security headers

## 📊 Performance Metrics

- **Frontend**: Lighthouse score 95+
- **Backend**: <100ms average response time
- **Database**: Optimized queries with indexing
- **Caching**: Redis for frequently accessed data
- **Monitoring**: Real-time metrics with Prometheus/Grafana

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

## 📈 Roadmap

### Phase 1: MVP ✅
- [x] Core scheduling engine
- [x] Basic UI components
- [x] Authentication system
- [x] Database schema

### Phase 2: Enhanced Features ✅
- [x] AI advisor integration
- [x] Multi-quarter planning
- [x] Interactive roadmap
- [x] Comprehensive testing

### Phase 3: Production Ready ✅
- [x] Docker containerization
- [x] CI/CD pipeline
- [x] Monitoring & logging
- [x] Security hardening

### Phase 4: Advanced Features 🚧
- [ ] Mobile app (React Native)
- [ ] Real-time collaboration
- [ ] Advanced analytics dashboard
- [ ] Integration with UCLA systems

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- UCLA Computer Science Department for course data
- OpenAI for GPT-4 API access
- shadcn/ui for beautiful UI components
- The open-source community for amazing tools

## 📞 Support

- 📧 Email: support@studystrata.com
- 💬 Discord: [Study Strata Community](https://discord.gg/studystrata)
- 📖 Documentation: [docs.studystrata.com](https://docs.studystrata.com)
- 🐛 Issues: [GitHub Issues](https://github.com/trunggo9000/study-strata/issues)

---

**Built with ❤️ for UCLA students by students**
