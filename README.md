# AI Personal Assistant Backend

A decision-first AI Personal Assistant backend that transforms unstructured user thoughts into clear decisions with prioritized actionable tasks.

## 🧠 Philosophy

This backend is built on a simple principle: **one decision, not many options**.

When you provide messy, unstructured thoughts, the AI:
1. Clarifies the core problem
2. Proposes ONE clear direction
3. Breaks it into prioritized actions
4. Ends with: *"Are we aligned, or should we challenge this before moving on?"*

## 🏗️ Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express
- **Database**: PostgreSQL
- **AI**: OpenAI API
- **Style**: Clean, modular, boring, scalable

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.js                    # Express app configuration
│   ├── server.js                 # Server entry point
│   ├── config/
│   │   ├── env.js               # Environment configuration
│   │   ├── db.js                # PostgreSQL connection
│   │   └── openai.js            # OpenAI client setup
│   ├── routes/
│   │   ├── decision.routes.js   # Decision endpoints
│   │   ├── task.routes.js       # Task endpoints
│   │   └── health.routes.js     # Health check endpoints
│   ├── controllers/
│   │   ├── decision.controller.js
│   │   ├── task.controller.js
│   │   └── health.controller.js
│   ├── services/
│   │   ├── ai/
│   │   │   ├── promptBuilder.js   # AI prompt construction
│   │   │   ├── decisionEngine.js  # Core AI logic
│   │   │   └── responseParser.js  # AI response parsing
│   │   ├── task/
│   │   │   ├── taskService.js     # Task CRUD operations
│   │   │   └── priorityService.js # Priority management
│   │   └── memory/
│   │       ├── contextService.js  # User context retrieval
│   │       └── summaryService.js  # Session summarization
│   ├── models/
│   │   ├── decision.model.js
│   │   ├── task.model.js
│   │   └── user.model.js
│   ├── middlewares/
│   │   ├── error.middleware.js   # Error handling
│   │   └── requestLogger.js      # Request logging
│   └── utils/
│       ├── normalizeInput.js     # Input sanitization
│       └── confidenceScore.js    # Confidence calculation
├── migrations/
│   ├── 001_initial_schema.sql
│   └── run.js                    # Migration runner
├── package.json
├── env.example
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- OpenAI API key

### Installation

1. **Clone and install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment**
   ```bash
   cp env.example .env
   # Edit .env with your values
   ```

3. **Set up database**
   ```bash
   # Create database
   createdb ai_assistant
   
   # Run migrations
   npm run migrate
   ```

4. **Start the server**
   ```bash
   # Development (with auto-reload)
   npm run dev
   
   # Production
   npm start
   ```

## 🔌 API Endpoints

### Health Check

```http
GET /health
```

Returns:
```json
{ "status": "ok" }
```

### Generate Decision

```http
POST /decision
Content-Type: application/json

{
  "userInput": "I'm feeling overwhelmed with work. I have 3 projects due, my inbox is overflowing, and I haven't exercised in weeks. I know I should prioritize but everything feels urgent.",
  "userId": "optional-user-id"
}
```

Returns:
```json
{
  "success": true,
  "data": {
    "decision": "Focus exclusively on completing your highest-impact project this week",
    "reasoning": "When everything feels urgent, nothing gets done well. Your highest-impact project likely has the most significant consequences for your career or deliverables. Exercise and email can wait - you need to break the paralysis first. Are we aligned, or should we challenge this before moving on?",
    "tasks": [
      { "title": "Identify which project has the biggest impact if completed", "priority": 1 },
      { "title": "Block 4 hours tomorrow morning for deep work on that project", "priority": 2 },
      { "title": "Send a quick status update to stakeholders on other projects", "priority": 3 },
      { "title": "Schedule 30-min email triage for end of day only", "priority": 4 }
    ],
    "confidence": 0.82
  }
}
```

### Get Decision

```http
GET /decision/:id
```

### Refine Decision

```http
POST /decision/:id/refine
Content-Type: application/json

{
  "feedback": "Actually, one of the other projects has a hard deadline tomorrow"
}
```

### Task Management

```http
# Get task
GET /task/:id

# Get tasks for decision
GET /task/decision/:decisionId

# Update task status
PATCH /task/:id/status
{ "status": "completed" }

# Update priority
PATCH /task/:id/priority
{ "priority": 2 }
```

## ⚙️ Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 5432 |
| `DB_NAME` | Database name | ai_assistant |
| `DB_USER` | Database user | user |
| `DB_PASSWORD` | Database password | password |
| `OPENAI_API_KEY` | OpenAI API key | - |
| `OPENAI_MODEL` | OpenAI model | gpt-4 |

## 🧩 Design Principles

1. **One responsibility per file** - Easy to find and modify code
2. **No business logic in routes** - Controllers and services handle logic
3. **AI logic isolated** - All AI code lives in `services/ai/`
4. **No framework magic** - Explicit, readable, debuggable
5. **Boring technology** - Proven, stable, well-documented

## 🔧 Development

```bash
# Run in development mode
npm run dev

# Run migrations
npm run migrate
```

## 📜 License

MIT

# AI-companinon-front-end
# AI-companinon-backend
# AI-companinon-backend
# AI-companinon-backend
# AI-companinon-backend
# AI-companinon-backend
