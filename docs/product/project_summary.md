# Email Triage Agent
**Team:** Jason Wu and Ethan Diec

**A context-aware inbox assistant for founders who need to know what deserves attention today.**

Email Triage Agent is a SaaS-style dashboard that turns a crowded inbox into a clear daily action plan. Instead of giving generic email summaries, it asks for the founder's current business context, reads incoming messages through that lens, and organizes them into three practical buckets: **Act today**, **Decide this week**, and **FYI**.

## The Problem

Early-stage founders juggle product work, customers, investors, partners, school, vendors, and team coordination in the same inbox. Important threads can look identical to newsletters or routine updates, and general-purpose AI tools often summarize what an email says without explaining why it matters right now. The result is missed follow-ups, delayed decisions, and time lost to inbox archaeology.

## Our Solution

Email Triage Agent prioritizes email around the user's stated goals and workflows. A founder can describe what they are focused on this week, connect Gmail or use the mock demo inbox, and run triage. The agent streams each result into the dashboard with a priority score, a short reason, a summary, concrete next steps, and, when useful, a draft reply.

## What You Can Try

1. Open the live deployed app at https://csen-174-s26-team-project-email-tri.vercel.app
2. Connect your Gmail account through Google OAuth to triage your inbox.
- We suggest using our demo email account to triage the inbox (demotriage@gmail.com, password: demotriage123)
- If you'd like to try with your own inbox, you can connect your Gmail account as well.
3. Open the dashboard and review the founder context prompt.
3. Click **Run triage** to watch emails stream into the three buckets.
4. Compare the buckets, priority reasons, next steps, and draft replies.