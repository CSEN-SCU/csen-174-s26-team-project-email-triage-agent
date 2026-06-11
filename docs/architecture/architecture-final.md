# Code Freeze Architecture — Email Triage Agent

**Tag:** `demo-night` ([a681e69](https://github.com/CSEN-SCU/csen-174-s26-team-project-email-triage-agent/commit/a681e69965080ca41f8fcee6eea1c436213eda66))

This document is the final architecture at code freeze. The logical container model matches our [W8 revised architecture](./architecture-retrospective.md) (Part 3). What differs at freeze is production deployment: the Next.js web app on Vercel, the FastAPI backend and PostgreSQL on AWS EC2 (Docker Compose), and a Cloudflare tunnel between the Vercel proxy and the private backend.

---

## C4 Context Model

```mermaid
flowchart TB
  founder["Founder / user"]

  system["Email Triage Agent\n(consolidated_project)"]

  subgraph hosting["Deployment"]
    vercel["Vercel\nNext.js frontend"]
    aws["AWS EC2\nDocker Compose stack"]
    cf["Cloudflare Tunnel\noutbound-only edge"]
  end

  subgraph external["External systems"]
    google["Google\nOAuth 2.0 + Gmail API"]
    claude["Claude Agent SDK\n+ Anthropic API"]
    pg[("PostgreSQL")]
  end

  founder -->|"HTTPS"| system
  system --> vercel
  system --> aws
  vercel -->|"API proxy"| cf
  cf --> aws
  system --> google
  system --> claude
  aws --> pg

  style vercel fill:#e3f2fd,stroke:#1565c0
  style aws fill:#e8eaf6,stroke:#3949ab
  style cf fill:#f3e5f5,stroke:#7b1fa2
  style claude fill:#ffe0e0,stroke:#c62828
  style google fill:#fff8e1,stroke:#f57f17
```

---

## C4 Container Model

```mermaid
flowchart TB
  founder["Founder / user"]

  subgraph vercel["Vercel — Web application (Next.js 15)"]
    marketing["Marketing UI\napp/(marketing)/*"]
    dashboard["Dashboard UI\napp/(app)/app/page.tsx"]
    nextauth["NextAuth v5\nauth.ts"]
    proxy["API proxy\napp/api/[...path]/route.ts\n+ x-gateway-key"]
    apiclient["Browser client\nlib/api.ts"]
    marketing --> apiclient
    dashboard --> apiclient
    marketing --> nextauth
    dashboard --> nextauth
    apiclient --> proxy
  end

  subgraph ec2["AWS EC2 — Docker Compose"]
    cloudflared["cloudflared\noutbound tunnel"]
    subgraph api["Container: API (FastAPI)"]
      routes["Routes\napp/api/routes.py\nREST + SSE /triage/stream"]
      security["Security\nsanitize, rate limit, gateway"]
      gmailmod["Gmail client\napp/auth/gmail.py"]
      inbox["Inbox + mock fallback\ninbox_repository, mock_inbox"]
      profiles["Profile cache\nprofile_repository.py"]
      routes --> security
      routes --> gmailmod
      routes --> inbox
      routes --> profiles
    end
    subgraph sdk["Container: Agent SDK pipeline"]
      orchestrator["Orchestrator\napp/agent/orchestrator.py"]
      tools["MCP tools\napp/agent/tools.py"]
      enrich["Enrichment subagent\napp/agent/subagents.py"]
      drafter["Drafter subagent\napp/agent/subagents.py"]
      orchestrator --> tools
      orchestrator --> enrich
      orchestrator --> drafter
    end
    pg[("PostgreSQL\nprofile + inbox rows")]
    cloudflared --> routes
  end

  google_oauth["Google OAuth"]
  gmail_api["Gmail API v1"]
  anthropic["Anthropic API"]

  founder --> marketing
  founder --> dashboard
  nextauth --> google_oauth
  proxy -->|"HTTPS /api/*\nBearer + gateway key"| cloudflared
  gmailmod --> gmail_api
  tools --> gmail_api
  inbox --> pg
  profiles --> pg
  routes -->|"triage_email()"| orchestrator
  orchestrator --> routes
  orchestrator --> anthropic
  enrich --> anthropic
  drafter --> anthropic

  style vercel fill:#e3f2fd,stroke:#1565c0
  style api fill:#e8eaf6,stroke:#3949ab
  style sdk fill:#e0f2f1,stroke:#00695c
  style cloudflared fill:#f3e5f5,stroke:#7b1fa2
  style anthropic fill:#ffe0e0,stroke:#c62828
  style google_oauth fill:#fff8e1,stroke:#f57f17
  style gmail_api fill:#fff8e1,stroke:#f57f17
```

---

## Container summary

| Container | Host | Role | Key paths |
|---|---|---|---|
| Web (Next.js) | Vercel | Marketing, `/app` dashboard, OAuth session, API proxy | `frontend/app/`, `frontend/auth.ts`, `frontend/lib/api.ts` |
| cloudflared | AWS EC2 | Outbound tunnel; no inbound ports on host | `docker-compose.prod.yml` |
| API (FastAPI) | AWS EC2 | REST + SSE, Gmail, security, inbox, profile cache | `backend/app/api/routes.py`, `backend/app/auth/gmail.py` |
| Agent SDK | AWS EC2 (in-process) | Orchestrator, enrichment + drafter subagents, MCP tools | `backend/app/agent/orchestrator.py`, `tools.py`, `subagents.py` |
| PostgreSQL | AWS EC2 | Voice/relationship profiles; optional inbox persistence | `backend/app/profile_repository.py` |
| Google | External | OAuth sign-in, inbox read, draft/send | Scopes in `frontend/auth.ts` |
| Anthropic | External | Classification, summary, actions, drafts via SDK | `ANTHROPIC_API_KEY`, Claude Code CLI |

---

## Request path (triage)

1. Founder sets context and clicks Run triage on the dashboard (`page.tsx`).
2. Browser calls `/api/triage/stream` via `lib/api.ts`.
3. Next.js proxy (`route.ts`) attaches the Google access token and `x-gateway-key`, forwards to the Cloudflare tunnel hostname.
4. `cloudflared` on EC2 routes to `backend:8000`; FastAPI `routes.py` validates gateway key and rate limit.
5. Routes load emails from Gmail (or mock inbox), invoke `triage_email()` on the orchestrator.
6. Orchestrator runs the SDK pipeline: classify → summarize → actions → optional draft via enrichment + drafter subagents and Gmail MCP tools.
7. Each `TriageResult` streams back over SSE to the browser and renders in `BucketColumn` / `TriageCard`.

---

## Repo anchors

| Topic | Location |
|---|---|
| W8 revised architecture (logical baseline) | [architecture-retrospective.md](./architecture-retrospective.md) Part 3 |
| W4 planned architecture | [architecture.md](./architecture.md) |
| Production compose stack | [docker-compose.prod.yml](../../consolidated_project/docker-compose.prod.yml) |
| Deploy script | [infra/scripts/deploy.sh](../../infra/scripts/deploy.sh) |
| Agent SDK migration | [PR #23](https://github.com/CSEN-SCU/csen-174-s26-team-project-email-triage-agent/pull/23) |
