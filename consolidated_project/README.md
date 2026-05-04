#  Email Triage Agent

FastAPI + Pydantic + LangGraph + Claude API on the backend. Next.js 15 + Tailwind on the frontend. Built to realize a three-card daily digest (Act today / Decide this week / FYI) that adapts to the founder's current context instead of generic Gemini-style summaries.

## Tests (one command)

From **`consolidated_project/`**:

1. Frontend: `cd frontend && npm install`
2. Backend: `cd backend && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`

Then:

```bash
npm test
```

Runs frontend Vitest (`vitest run`) and backend `unittest` discovery via `scripts/test-backend.sh` (uses `backend/.venv` only if `import fastapi` works there — otherwise `python3` on your `PATH`). Set `PYTHONPATH` is handled in the script. DB and live Claude tests skip without `DATABASE_URL` and `ANTHROPIC_API_KEY` / `CLAUDE_API_KEY`.

If backend tests fail with `ModuleNotFoundError` for `fastapi` / `sqlalchemy`, your `backend/.venv` may be broken (e.g. copied from another path). Remove it and recreate: `rm -rf .venv && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`.

## Run locally

Two terminals.

**Backend**
```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env     # paste ANTHROPIC_API_KEY
uvicorn app.main:app --reload --port 8000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev              # http://localhost:3000
```

Click **Run triage**. Results stream into the three buckets as each email
finishes going through the LangGraph agent.

## How it's organized

- `backend/app/agent/graph.py` — LangGraph: `classify → summarize → actions → (draft | skip) → END`.
- `backend/app/agent/prompts.py` — every prompt injects the user's context blurb; this is the anti-Gemini differentiator.
- `backend/app/data/mock_inbox.py` — 11 seeded emails modeled on the Maya storyboard (including the buried-11-days Bessemer thread from Frame 3).
- `backend/app/api/routes.py` — `/emails`, `/context`, `/triage`, `/triage/stream` (SSE).
- `frontend/app/page.tsx` — three-card dashboard; streams results over SSE.

## What's intentionally out of scope for this pass

- Real Gmail OAuth (the inbox is mocked; swap `MOCK_EMAILS` for a Gmail client later).
- Persistent storage (user context is in-process; fine for a demo, replace with Postgres or SQLite).
- Auth / multi-user.
- Per-email "send" action (draft is shown read-only; wiring Gmail send is a one-endpoint addition once OAuth is in).
