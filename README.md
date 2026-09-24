# CodePilotX

Hackathon-ready Human–AI Collaborative Coding Intelligence Platform.

## Stack
- Frontend: React + TypeScript + Vite + Tailwind CSS + Monaco + Recharts
- Backend: FastAPI + SQLAlchemy + PostgreSQL
- Auth: Supabase Auth (production) with JWT verification hook
- AI: configurable backend LLM provider
- Execution: Docker sandbox service
- Database: PostgreSQL

## Quick start

### 1. Environment
Copy `.env.example` to `.env` and fill values.

### 2. Database
```bash
docker compose up -d db
```

Apply `database/schema.sql` to PostgreSQL.

### 3. Backend
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 4. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 5. Execution service
The execution service is isolated from the API. Build it with:
```bash
docker build -t codepilotx-executor execution-service
```

For a local demo, the backend can use the executor URL configured in `EXECUTION_SERVICE_URL`.

## Important
This repository intentionally does not contain secrets. Use `.env.example`.

The app never treats UI-only state as authoritative. Important metrics are calculated from persisted records.
