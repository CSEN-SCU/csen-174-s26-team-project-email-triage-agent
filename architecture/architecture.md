# Consolidation Plan
Use Jason's prototype as a starting point, as a single page for the bulk of functionality seems more appropriate for this project. Include a similar tabbing ability from Ethan's prototype. Where Ethan has top buttons going to different pages, keep everything on one page and then add sidebar buttons. Also add the collapsibility from Ethan's prototype.

# C4 Context Model
```mermaid
flowchart TB
  entrepreneur["Entrepreneur / Founder\n(Person)"]

  system["Email Triage Agent\n(Software System)\nJason prototype — UI + API + LangGraph"]

  subgraph infra["Infrastructure"]
    kubernetes["Kubernetes\nContainer orchestration / scheduling"]
  end

  subgraph external["External Systems"]
    direction TB
    anthropic["Anthropic Claude API\nLLM: classify, summarize, actions, draft"]
    redis["Redis\nAgent / triage response cache"]
    email["Email Provider\n(e.g. Gmail / IMAP — planned)"]
    database["Database\n(e.g. Postgres / SQLite — planned)"]
  end

  entrepreneur -->|"Uses dashboard, context, triage"| system
  system -->|"Runs as workloads"| kubernetes
  system -->|"HTTPS (Messages API)"| anthropic
  system -->|"Read / write cache"| redis
  system -.->|"Planned integration"| email
  system -.->|"Planned integration"| database

  %% Styling
  style entrepreneur fill:#d5f5d5,stroke:#2e7d32,stroke-width:2px
  style system fill:#d6eaff,stroke:#1565c0,stroke-width:2px
  style kubernetes fill:#e8f4fc,stroke:#326ce5,stroke-width:2px
  style anthropic fill:#ffe0e0,stroke:#c62828,stroke-width:2px
  style redis fill:#fce8e8,stroke:#dc382d,stroke-width:2px
  style email fill:#fff8e1,stroke:#f57f17,stroke-width:2px
  style database fill:#fff8e1,stroke:#f57f17,stroke-width:2px
```

# C4 Container Model
```mermaid
flowchart TB
  subgraph k8s["Kubernetes (deployment boundary)"]
    subgraph fe["Container: Web — Next.js 15"]
      ui["UI\napp/page.tsx, components/*"]
      client["HTTP client\nlib/api.ts"]
      tsSchema["Client types\nlib/types.ts"]
      ui --> client
      client -.->|"mirrors JSON"| tsSchema
    end

    subgraph be["Container: API — FastAPI"]
      app["ASGI app\napp/main.py — CORS, /api router"]
      routes["HTTP + SSE\napp/api/routes.py"]
      ioModels["Request bodies\nContextPayload, TriagePayload\n(routes.py)"]
      domain["Domain + API schema\napp/models/email.py\n(BaseModel / Enum)"]
      mock["In-process inbox\napp/data/mock_inbox.py\nMOCK_EMAILS: list[Email]"]
      ctx["In-process context\nmodule _user_context in routes.py"]
      agent["AI execution\napp/agent/graph.py\nLangGraph StateGraph"]
      prompts["Prompts\napp/agent/prompts.py"]
      app --> routes
      routes --> ioModels
      routes --> domain
      routes --> mock
      routes --> ctx
      routes -->|"POST /triage, /triage/stream"| agent
      agent --> prompts
    end

    subgraph planned["Planned containers (not wired in repo)"]
      redis["Redis\nagent/triage response cache"]
      db["PostgreSQL / SQLite\npersistence"]
    end
  end

  anthropic["Anthropic Claude API\nMessages API"]

  client -->|"HTTPS JSON; SSE /api/triage/stream\nNext rewrite → NEXT_PUBLIC_API_BASE"| routes
  agent -->|"HTTPS + API key\nclassify / triage models"| anthropic

  routes --> redis
  routes --> db

  style fe fill:#e3f2fd,stroke:#1565c0
  style be fill:#e8eaf6,stroke:#3949ab
  style planned fill:#fafafa,stroke:#9e9e9e,stroke-dasharray: 4 4
  style anthropic fill:#ffe0e0,stroke:#c62828
  style k8s fill:#f5f5f5,stroke:#607d8b
```