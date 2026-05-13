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
- `backend/app/auth/gmail.py` — Gmail client. Accepts the access token forwarded by the Next.js proxy and returns `Email` models.
- `backend/app/auth/deps.py` — FastAPI dep that pulls the Bearer token out of the `Authorization` header.
- `frontend/auth.ts` — NextAuth v5 config (Google provider, `gmail.readonly` scope, refresh-token flow in the `jwt` callback).
- `frontend/app/api/[...path]/route.ts` — Next.js App Router proxy. Reads the NextAuth session, injects `Authorization: Bearer <google_access_token>` and forwards every `/api/*` call to FastAPI (streaming-safe for SSE).
- `frontend/app/page.tsx` — three-bucket dashboard; streams results over SSE.

## Gmail OAuth (NextAuth v5)

Auth lives on the frontend; the backend just consumes whatever access token
the proxy hands it. When no token is present, FastAPI falls back to the mock
inbox so the demo works without credentials.

### 1. Create a Google OAuth client

1. Open the [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials).
2. **Configure an OAuth consent screen** (External, testing mode is fine). Add yourself as a test user.
3. **Enable the Gmail API** at *APIs & Services → Library*.
4. **Create credentials → OAuth client ID → Web application.**
5. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google` (exact match).
6. Copy the client ID + secret.

### 2. Configure the frontend

```bash
cd frontend
cp .env.example .env.local
# fill AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, AUTH_SECRET (`openssl rand -base64 32`)
npm install                # installs next-auth v5
npm run dev
```

Click **Connect Gmail** in the nav. After consent, the chip flips to your
avatar/email and the page reloads with your live inbox.

### How the token flows end-to-end

1. NextAuth handles the OAuth dance and stores `{access_token, refresh_token, expires_at}` in an encrypted JWT cookie.
2. The `jwt` callback refreshes the access token automatically when within 60s of expiry.
3. Every `fetch("/api/...")` hits `app/api/[...path]/route.ts`. It calls `auth()`, reads `session.accessToken`, sets `Authorization: Bearer <token>` and proxies to `BACKEND_URL`.
4. FastAPI's `gmail_access_token` dep picks the Bearer up; when present the routes hit the Gmail API, otherwise they serve the mock inbox.

### What's still out of scope for this pass

- Per-email "send" action (drafts are read-only; would need `gmail.send` scope + endpoint).
- Persistent storage of the user-context blurb (still in-process).
- Multi-user state (per-session context, agent caches).
