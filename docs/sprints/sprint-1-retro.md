# Celebrate

**Jason** leaned hard into making the triage agent feel sales-focused, rather than just generic “here’s a summary” copy. He ensured that language and framing nudged toward next steps. That showed up in prompt tuning and how the graph reasons about buckets.

**Ethan** shipped Google OAuth end-to-end so we’re not faking identity anymore, and added some UI polish on top of that. This included collapsible buckets so the board doesn’t feel like a wall of cards when you’re trying to scan, plus smaller layout tweaks that made the dashboard more pleasant to click around.

Something we could improve a little more is working more as a team when creating features. It makes it easier for us to be able to do things once when we both agree on how something like UI should be implemented compared to one of us creating a feature then having the other make changes.

# AI Tools Reflection

**Easier — Cursor:** It stayed useful across `consolidated_project/frontend` and the backend in one thread (wiring `/api` rewrites and fixing the Vitest mock in `test/api.test.ts` without constant tab-hopping). Pasting the SSE contract from `routes.py` and asking for matching `lib/types.ts` also caught small shape drift early.

**Easier — Agent skills:** We used the problem framing and storyboard skills in `.cursor/skills/` when we were rushing to solutions. They pushed us through assumptions and HMW-style questions; we dropped the good bits into Discord and trimmed them into `docs/` so everyone could react.

**Harder:** The repo has three parallel trees (Ethan / Jason / consolidated), so we often got diffs aimed at the wrong folder until we pasted full paths every time. For OAuth, the model would “ship” stub callbacks. We still verified redirect URLs and env names in Google Cloud by hand. For LangGraph streaming bugs, we still stepped through `graph.py` ourselves; skills did not replace reading the code.

# Sprint 2 Commitments

1. **Send email drafts straight from the dashboard** — wire a safe “send” path from the triage UI (with confirmation + clear failure states) so a draft isn’t read-only theater anymore.
https://github.com/orgs/CSEN-SCU/projects/8/views/1?pane=issue&itemId=178726345&issue=CSEN-SCU%7Ccsen-174-s26-team-project-email-triage-agent%7C7

2. **Regenerate drafted emails** — let users rerun or tweak the draft step without re-triaging the whole thread, so when the tone is off you’re not starting from zero.
https://github.com/orgs/CSEN-SCU/projects/8/views/1?pane=issue&itemId=178726407&issue=CSEN-SCU%7Ccsen-174-s26-team-project-email-triage-agent%7C8

3. **Profile tab to enhance agent context** — a dedicated place to edit founder / company context that feeds prompts, so the agent stops sounding generic and we can demo “this is *my* pipeline” in class.
https://github.com/orgs/CSEN-SCU/projects/8/views/1?pane=issue&itemId=178726297&issue=CSEN-SCU%7Ccsen-174-s26-team-project-email-triage-agent%7C6