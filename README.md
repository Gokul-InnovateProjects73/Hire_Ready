# 🎯 HireReady — AI-Powered Interview Preparation Platform

A full-stack MERN platform that helps students prepare for coding, HR, and technical interviews through mock interviews, coding tests, AI-based feedback, and performance analytics.

---

## 🚀 Features

### Core Features
| Feature | Description |
|---|---|
| 🔐 **User Authentication** | JWT-based registration/login with role support (user/admin) |
| 💻 **Coding Editor** | Monaco-based editor with multi-language support and real-time test case execution |
| 🤖 **AI Feedback** | OpenAI-powered code review, interview tips, and mock question generation |
| 📚 **Question Bank** | DSA, HR, Core subjects (OS, DBMS, Networks, OOP) with difficulty levels |
| 📊 **Progress Dashboard** | Charts showing submission trends, category breakdown, and activity heatmap |
| 📄 **Resume Analyzer** | AI-powered resume analysis with improvement suggestions |
| 🛠️ **Admin Panel** | Manage questions, users, and view platform-wide statistics |

### Advanced Features
| Feature | Description |
|---|---|
| 🏆 **Leaderboard** | Global ranking by problems solved, acceptance rate, and streak |
| 🧩 **Mock Interviews** | Topic-based mock interview question generation |
| 🏢 **Company Paths** | Filter questions by company (Google, Amazon, Meta, etc.) |
| 📈 **Analytics** | Streak tracking, daily heatmap, and performance trends |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React (Vite), React Router, Recharts, Monaco Editor, Axios |
| **Backend** | Node.js, Express.js, JWT Auth, Express Rate Limiter |
| **Database** | MongoDB + Mongoose ODM |
| **Cache** | Redis (with in-memory fallback) |
| **AI** | OpenAI API (with intelligent mock fallback) |
| **Deployment** | Docker + Docker Compose + Nginx |

---

## 📁 Project Structure

```
Hire_Ready/
├── client/                    # React frontend (Vite)
│   ├── src/
│   │   ├── api/               # Axios configuration
│   │   ├── context/           # Auth context
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components
│   │   └── styles/            # Global CSS
│   ├── Dockerfile
│   └── nginx.conf
├── server/                    # Node.js/Express backend
│   ├── src/
│   │   ├── config/            # DB and Redis connections
│   │   ├── controllers/       # Business logic
│   │   ├── middleware/         # Auth + Admin guards
│   │   ├── models/            # Mongoose models
│   │   ├── routes/            # API routes
│   │   ├── scripts/           # DB seeding
│   │   └── utils/             # Code executor, AI service
│   ├── .env.example
│   └── Dockerfile
└── docker-compose.yml
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Redis (optional — in-memory fallback included)

### 1. Clone and set up environment

```bash
git clone https://github.com/Gokul-InnovateProjects73/Hire_Ready.git
cd Hire_Ready
```

### 2. Backend setup

```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
npm run seed      # Populate DB with sample questions + admin user
npm run dev       # Start backend on http://localhost:5000
```

### 3. Frontend setup

```bash
cd client
npm install
npm run dev       # Start frontend on http://localhost:3000
```

### Default Credentials (after seeding)
| Role | Email | Password |
|---|---|---|
| Admin | admin@hireready.com | Admin@123 |
| Demo User | demo@hireready.com | Demo@123 |

---

## 🐳 Docker Deployment

```bash
# Copy and configure environment
cp server/.env.example .env
# Edit .env with your settings

# Build and start all services
docker-compose up --build

# Seed the database
docker-compose exec server npm run seed
```

Services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017
- Redis: localhost:6379

---

## 🔌 API Reference

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT |
| GET | `/api/auth/profile` | Get current user profile |
| PUT | `/api/auth/profile` | Update profile |

### Questions
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/questions` | List questions (filter by category/difficulty/company/search) |
| GET | `/api/questions/:id` | Get question details |
| POST | `/api/questions` | Create question (admin only) |
| PUT | `/api/questions/:id` | Update question (admin only) |
| DELETE | `/api/questions/:id` | Delete question (admin only) |

### Submissions
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/submissions/run` | Run code against test cases |
| POST | `/api/submissions/submit` | Submit solution with AI feedback |
| GET | `/api/submissions/my` | Get user's submission history |

### AI Tools
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ai/feedback` | Analyze code quality |
| POST | `/api/ai/resume` | Analyze resume text |
| POST | `/api/ai/interview-tip` | Get interview tips by topic |
| GET | `/api/ai/mock-questions` | Generate mock interview questions |

### Progress & Leaderboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/progress/dashboard` | Stats, chart data, recent activity |
| GET | `/api/progress/heatmap` | Daily activity heatmap data |
| GET | `/api/progress/streak` | Current streak info |
| GET | `/api/leaderboard` | Global rankings |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/users` | List all users |
| PUT | `/api/admin/users/:id` | Update user role |
| GET | `/api/admin/stats` | Platform statistics |
| POST | `/api/admin/questions/bulk` | Bulk import questions |

---

## 🤖 AI Configuration

The platform works without an OpenAI API key by using intelligent mock responses. To enable real AI:

1. Get an API key from [OpenAI](https://platform.openai.com/)
2. Add to `server/.env`:
   ```
   OPENAI_API_KEY=sk-...
   ```

---

## 💼 Revenue Model

- **Freemium**: Basic question bank and limited submissions
- **Premium**: Unlimited access, AI feedback, mock interviews, and resume analysis
- **College Partnerships**: Institutional licensing with custom question banks

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request