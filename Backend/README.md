# Kriyanto Backend (Production-ready Foundation)

FastAPI backend for the Kriyanto RAG application with:
- JWT auth (register/login/refresh/me)
- PostgreSQL persistence for users + chat history
- Protected chat session/message APIs
- Temporary/stub RAG endpoints (ready to replace when available)
- CORS support for the existing frontend (`localhost:5173`)

## 1) Tech Stack
- FastAPI
- SQLAlchemy 2 (async)
- PostgreSQL (`psycopg3`)
- JWT (`python-jose`)
- Password hashing (`passlib` + bcrypt)

## 2) Setup Guide (Dynamic / Env-based)

### Prerequisites
- Python 3.11+
- PostgreSQL 14+

### Step A: Create database
```bash
psql -U postgres -f scripts/setup_db.sql
```

### Step B: Install dependencies
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Step C: Configure env
```bash
cp .env.example .env
```
Then update at least:
- `DATABASE_URL`
- `JWT_SECRET_KEY`
- `JWT_REFRESH_SECRET_KEY`
- SMTP vars (`MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM`, `MAIL_PORT`, `MAIL_SERVER`)
- `CORS_ORIGINS` (for your frontend origin)

### Step D: Run API
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs:
- Swagger: `http://localhost:8000/docs`
- OpenAPI: `http://localhost:8000/openapi.json`

## 3) API Routes
Base prefix: `/api/v1`

### Health
- `GET /api/v1/health`

### Auth
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/auth/me` (Bearer token)
- `POST /api/v1/auth/forgot-password` (sends 6-digit OTP via email)
- `POST /api/v1/auth/reset-password` (resets password with email + OTP)

### Chat (Bearer token)
- `POST /api/v1/chats/sessions`
- `GET /api/v1/chats/sessions`
- `GET /api/v1/chats/sessions/{session_id}`
- `POST /api/v1/chats/sessions/{session_id}/messages`
- `DELETE /api/v1/chats/sessions/{session_id}`

### RAG (Temporary, Bearer token)
- `POST /api/v1/rag/query`
- `POST /api/v1/rag/ingest`
- `GET /api/v1/rag/status/{job_id}`

## 4) Frontend Connection Notes
No frontend code change is required immediately. The backend already:
- allows local frontend origins via CORS,
- exposes auth/chat/rag endpoints the frontend can call,
- persists user and chat history to PostgreSQL.

When you wire frontend requests, point them to `http://localhost:8000/api/v1/...`.

## 5) Production Hardening Checklist
Before going live:
- Put app behind reverse proxy (Nginx/Traefik)
- Use strong random JWT secrets
- Use HTTPS only
- Add rate limiting + brute force protection
- Add structured logging + tracing
- Add migrations (Alembic) for schema evolution
- Add background worker for real RAG ingestion/query orchestration
- Tune password reset OTP throttling/anti-abuse protections
- Add test suite + CI
