# Email Triage Agent — Frontend

Next.js 15 · React 19 · Tailwind.

## Quickstart

```bash
cd prototypes/jason/frontend
npm install
npm run dev      # http://localhost:3000
```

Ensure the backend is running on :8000 (see `../backend/README.md`). Requests to
`/api/*` are rewritten to `http://localhost:8000/api/*` by `next.config.ts`.

Override the backend URL:

```bash
NEXT_PUBLIC_API_BASE=https://your-backend.example.com npm run dev
```

## Screens

Single page (`app/page.tsx`) implementing the storyboard's Frame 5 "Aha" moment —
three stacked buckets replacing the wall of unread mail:

- **Act today** — priority ≥ 80. Accent-ring cards.
- **Decide this week** — 40–79. Yellow ring.
- **FYI** — archived-by-default skim pile.

`ContextCard` captures the founder's context blurb (Frame 4) and persists it to
the backend. Triage runs stream in per-email via SSE so cards materialize as
each agent run completes.

## Structure

```
app/
├── layout.tsx       root HTML, paper background, metadata
├── page.tsx         dashboard (context + triage buckets)
└── globals.css      Tailwind layers, paper grain, card shadows
components/
├── ContextCard.tsx  "what are you working on" input
├── TriageCard.tsx   per-email card: summary + reason + actions + draft
└── BucketColumn.tsx act / decide / fyi grouping
lib/
├── api.ts           typed fetch + SSE triage stream
└── types.ts         shared with backend Pydantic models
```
