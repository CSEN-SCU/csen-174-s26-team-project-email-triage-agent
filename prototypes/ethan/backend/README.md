# Ethan prototype — API

FastAPI service with **SQLite** (file DB), the same **seed emails/tasks** as the Next.js mocks, and **OpenAI** for `POST /api/emails/{id}/analyze`.

## Run locally

From this directory:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# add OPENAI_API_KEY to .env for the analyze endpoint
uvicorn app.main:app --reload --port 8000
```

- Docs: `http://127.0.0.1:8000/docs`
- Health: `GET /api/health`
- Inbox-shaped JSON: `GET /api/emails`, `GET /api/tasks`, `GET /api/insights/weekly`
- AI refresh (persists to DB): `POST /api/emails/{id}/analyze`
- Task toggle: `PATCH /api/tasks/{id}` with body `{"completed": true}`

The SQLite file path defaults to `./ethan_triage.db` (created next to where you run uvicorn). Delete that file to re-run the seed on next startup.

The Next.js inbox (`../frontend/app/inbox/page.tsx`) calls this API when it is reachable (same machine: port **8000** matches the default `NEXT_PUBLIC_TRIAGE_API_BASE_URL`).
