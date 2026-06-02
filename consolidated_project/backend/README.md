# Email Triage Agent — Backend

FastAPI + Pydantic + LangGraph + Claude API.

## Quickstart

```bash
cd consolidated_project/backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then paste your ANTHROPIC_API_KEY
uvicorn app.main:app --reload --port 8000
```

Open http://localhost:8000/docs for the OpenAPI UI.

## Backend runtime requirements

The triage agent uses the Claude Agent SDK (`claude-agent-sdk`), which drives the
Claude Code CLI — a Node.js binary — as a subprocess. Install it once per
machine/image:

```bash
npm install -g @anthropic-ai/claude-code
```

Set `ANTHROPIC_API_KEY` (or `CLAUDE_API_KEY`) as before. If the CLI is not on
`$PATH`, set its location and pass it via `ClaudeAgentOptions(cli_path=...)`.

> Note: the SDK pulls in `mcp`/`sse-starlette`, which require `starlette>=0.49`.
> `requirements.txt` therefore pins `fastapi==0.136.3` (not the older 0.115.x).

## Architecture

```
app/
├── main.py            FastAPI app + CORS
├── config.py          Pydantic settings (env-driven)
├── api/routes.py      /emails, /context, /triage, /triage/stream
├── models/email.py    Pydantic models: Email, TriageSignal, TriageResult, TriageDigest
├── agent/
│   ├── prompts.py     Context-grounded prompts (the anti-Gemini differentiator)
│   └── graph.py       LangGraph: classify → summarize → actions → (draft|skip) → END
└── data/mock_inbox.py Seeded Maya-Chen storyboard inbox
```

## The agent graph

Each email runs through:

1. **classify** (Haiku 4.5) — intent + 0-100 priority + bucket + one-line reason.
2. **summarize** (Sonnet 4.6) — 1-2 sentences grounded in the founder's context.
3. **actions** (Sonnet 4.6) — 1-3 concrete next steps.
4. **conditional branch** — only draft a reply if the email is action-worthy;
   skip drafts for FYI / cold outreach / vendor / recruiting to save tokens.
5. **draft_reply** (Sonnet 4.6) — founder-voice reply with marked placeholders.

Every prompt injects the user's `context` blurb (from `/context`), so priority and
drafts are personalized — the core feature distinguishing this from generic
Gemini-in-Gmail summaries.

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET  | `/api/emails` | List mock inbox |
| GET  | `/api/emails/{id}` | Single email |
| GET  | `/api/context` | Read current user context blurb |
| POST | `/api/context` | Update user context blurb |
| POST | `/api/triage` | Run agent on all (or subset of) emails; returns bucketed digest |
| POST | `/api/triage/stream` | Same, as SSE — emits each `TriageResult` as it resolves |

## Models

Swap via env:

```
TRIAGE_MODEL=claude-sonnet-4-6
CLASSIFY_MODEL=claude-haiku-4-5-20251001
```
