# Part 1: Product Vision (Revisited)
FOR **entrepreneurs**

WHO **lead a small team, thus needing to balance time, prioritize high-value sales leads, and quickly respond to client communications received via email**

THE **Email Triage Agent** IS A **SaaS platform**

THAT **automatically organizes, prioritizes, and surfaces actionable insights from your inbox**

UNLIKE **general-purpose tools like Google Gemini in Gmail**

OUR PRODUCT **adapts based on your specific workflows, business context, and decision-making patterns to deliver a personalized email management system**

POWERED BY **an Antigravity multi-agent runtime, decentralized intent classification, priority scoring, semantic summarization, automated draft generation, and Google / Gmail API integration**

*Our product vision shifted to a sales-focused context to help entrepreneurs prioritize sales leads and client communications. Additionally, the technology stack was updated to reflect the transition to an Antigravity multi-agent architecture.*
________________

# Part 2: W4 Intended Architecture
Link to the W4 C4 context and container diagrams

[LINK](../architecture/architecture.md)

For the W4 intended architecture, the team planned to build a consolidated single-page Email Triage Agent application deployed as containerized workloads orchestrated on Kubernetes. The setup featured a Next.js 15 frontend and a FastAPI backend with a monolithic LangGraph pipeline running in-process to handle email classification, summarization, action extraction, and draft replies using the Anthropic Claude API. Additionally, the plan included deploying a PostgreSQL/SQLite database for email and context persistence and a Redis caching layer for agent and triage responses within the Kubernetes cluster.

________________
## Part 3: Current-State Architecture

### C4 Context Model

```mermaid
flowchart TB
  founder["Founder / user\n(Person)"]

  system["Email Triage Agent\n(Software system)\nconsolidated_project"]

  subgraph external["External systems"]
    google["Google\nOAuth 2.0 + Gmail API"]
    antigravity["Gemini API\nGemini 3.5 Flash"]
    postgres["PostgreSQL"]
    vercel["Vercel\n(frontend hosting)"]
    gfonts["Google Fonts CDN\n(next/font)"]
  end

  founder -->|"HTTPS browser"| system
  system -->|"Deployed on"| vercel
  system -->|"Sign-in, read inbox"| google
  system -->|"Antigravity agent pipeline"| antigravity
  system -->|"Database"| postgres
  system -.->|"Font files at build/runtime"| gfonts
```

### C4 Container Model

```mermaid
flowchart TB
  founder["Founder / user"]

  subgraph boundary["Email Triage Agent — consolidated_project"]
    subgraph web["Container: Web application (Next.js 15)"]
      marketing["Marketing UI\n(app/(marketing)/*, LandingPage)"]
      dashboard["Dashboard UI\n(app/(app)/app/page.tsx)"]
      nextauth["NextAuth v5\n(auth.ts, api/auth/[...nextauth])"]
      proxy["API proxy\n(app/api/[...path]/route.ts)"]
      apiclient["Browser API client\n(lib/api.ts)"]
      marketing --> apiclient
      dashboard --> apiclient
      dashboard --> nextauth
      marketing --> nextauth
      apiclient --> proxy
    end

    subgraph api["Container: API application (FastAPI)"]
      routes["HTTP + SSE routes\n(app/api/routes.py)"]
      security["Sanitize + rate limit\n(app/security/*)"]
      gmailmod["Gmail client\n(app/auth/gmail.py)"]
      inbox["Inbox repository\n(app/inbox_repository.py)"]
      routes --> security
      routes --> gmailmod
      routes --> inbox
    end

    subgraph agent_classifier["Container: Classifier Agent (Antigravity Runtime)"]
      classifier["Triage Classifier\n(agents/classifier/agent.py)"]
    end

    subgraph agent_summarizer["Container: Summarizer Agent (Antigravity Runtime)"]
      summarizer["Email Summarizer\n(agents/summarizer/agent.py)"]
    end

    subgraph agent_actions["Container: Actions Agent (Antigravity Runtime)"]
      actions["Action Extractor\n(agents/actions/agent.py)"]
    end

    subgraph agent_draft["Container: Draft Agent (Antigravity Runtime)"]
      draft["Reply Generator\n(agents/draft/agent.py)"]
    end
  end

  google_oauth["Google OAuth 2.0\n(accounts.google.com)"]
  google_token["Google token endpoint\n(oauth2.googleapis.com)"]
  gmail_api["Gmail API v1\n(googleapis.com)"]
  anthropic_api["Anthropic Messages API"]
  pg[("PostgreSQL")]

  founder -->|"HTTPS"| marketing
  founder -->|"HTTPS"| dashboard
  nextauth --> google_oauth
  nextauth --> google_token
  proxy -->|"HTTP /api/* + Bearer"| routes
  gmailmod --> gmail_api
  inbox --> pg

  routes -->|"Invokes triage pipeline"| classifier
  classifier -->|"Passes classification state"| summarizer
  summarizer -->|"Passes summary state"| actions
  actions -->|"If reply required"| draft
  actions -.->|"If FYI / no draft"| routes
  draft -->|"Returns draft reply"| routes

  classifier -->|"Calls API"| anthropic_api
  summarizer -->|"Calls API"| anthropic_api
  actions -->|"Calls API"| anthropic_api
  draft -->|"Calls API"| anthropic_api

  style web fill:#e3f2fd,stroke:#1565c0
  style api fill:#e8eaf6,stroke:#3949ab
  style agent_classifier fill:#e0f2f1,stroke:#00695c
  style agent_summarizer fill:#e0f7fa,stroke:#00838f
  style agent_actions fill:#e1f5fe,stroke:#0277bd
  style agent_draft fill:#f3e5f5,stroke:#6a1b9a
```
________________
# Part 4: Decisions that Shifted

### Transitioning from LangGraph to Antigravity Multi-Agent Architecture
- **Context**: The team needed to support independent, highly specialized agents that could be deployed and run in parallel, which became complex to coordinate and scale cleanly within a single in-process LangGraph StateGraph.
- **Decision**: We transitioned the LLM pipeline from an in-process LangGraph graph to a decentralized multi-agent system built on Antigravity, hosting each agent (Classifier, Summarizer, Actions, and Draft) in its own separate runtime environment.
- **Consequences**: This introduces communication overhead and operational complexity between independent runtime processes, but provides distinct execution isolation and scalability for each agent component.
- **Classification**: **Deliberate and prudent**. The shift was actively chosen to build a scalable and modular multi-agent structure leveraging the strengths of the Antigravity runtime.
________________
# Part 5: Tech Debt Heading into Code Freeze

### 1. Silent Database Fallback to In-Memory Mock Repository
- **Classification**: **Deliberate and prudent**. This fallback was explicitly added to allow seamless local development and demoing without requiring a live PostgreSQL instance, but it runs the risk of silently masking real connection failures in production.
- **Plan**: We will live with this through demo night to ensure maximum demo stability, but will implement explicit database health checks and connection error boundaries immediately afterward.

### 2. Synchronous Gmail API Operations in Worker Threads
- **Classification**: **Deliberate and prudent**. Using the official synchronous `google-api-python-client` library saved significant development time, but wrapping synchronous network calls in `asyncio.to_thread` consumes thread pool resources and limits maximum request concurrency.
- **Plan**: We will live with this through demo night since the concurrency during live demos is extremely low, but will transition to a fully asynchronous HTTP client (e.g. calling Gmail endpoints via `httpx`) post-demo.

### 3. Google OAuth 2.0 and Gmail API Integration
- **Classification**: **Inadvertent and reckless**. We built the frontend too early and didn't have a clear plan for the backend. We should have built the backend first and then the frontend.
- **Plan**: We will live with this through demo night since the concurrency during live demos is extremely low, but will transition to a fully asynchronous HTTP client (e.g. calling Gmail endpoints via `httpx`) post-demo.

________________
# Part 6: What We Would Do Differently

If we had another sprint, we would not have used LangGraph and instead would have used something like a Claude agent because it has more power. Claude's advantage is that it has filesystem permissions and can run its own scripts. This would be more useful for our use case because it would allow us to have more control over the agent's behavior and more flexibility in how it handles the email data.