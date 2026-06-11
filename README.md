# Team Name: Email Triage Agent

**Product Name: Email Triage Agent**

**Description:** The Email Triage Agent is a SaaS platform that automatically organizes, prioritizes, and surfaces actionable insights from your inbox

**Team Members:** Jason Wu, Ethan Diec

**Demo:** https://youtu.be/7VFHkREKf4k

**Live App:** https://csen-174-s26-team-project-email-tri.vercel.app

**Technical Report:** [Link](./docs/report/technical-report.md)

# How to Run the Project Locally:

**Prerequisites:** Node.js 18+, Python 3.11+, and an [Anthropic API key](https://console.anthropic.com/). Triage also requires the Claude Code CLI: `npm install -g @anthropic-ai/claude-code`.

1. Clone the repository
2. **Backend** (terminal 1):
   ```bash
   cd consolidated_project/backend
   python3 -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   cp .env.example .env   # add ANTHROPIC_API_KEY
   uvicorn app.main:app --reload --port 8000
   ```
3. **Frontend** (terminal 2):
   ```bash
   cd consolidated_project/frontend
   npm install
   cp .env.example .env.local   # see step 4
   npm run dev
   ```
4. **Google OAuth** — in [Google Cloud Console](https://console.cloud.google.com/apis/credentials), enable the Gmail API and create an OAuth web client. Add redirect URI `http://localhost:3000/api/auth/callback/google`. Put `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, and `AUTH_SECRET` (`openssl rand -base64 32`) in `consolidated_project/frontend/.env.local`.
5. Open `http://localhost:3000`, go to `/app`, click **Connect Gmail**, then **Run triage**