# Product

## Register

product

## Users

**Primary:** Solo technical founders who are building a product while managing a high-volume, multi-stakeholder inbox (investors, customers, partners, vendors).

**Context:** They open the app during focused work blocks, often under time pressure, with low tolerance for re-reading threads or generic AI summaries. They need a fast read on what requires action today versus what can wait or be skimmed.

**Job to be done:** Turn an overwhelming inbox into a small set of trustworthy, context-aware priorities so they can act with confidence and get back to building.

## Product Purpose

Email Triage Agent is a SaaS workflow that organizes, prioritizes, and surfaces actionable insights from email. Unlike general-purpose tools (e.g. Gemini in Gmail), it adapts to the founder's stated business context and decision patterns.

**Core experience:** A three-bucket daily digest — **Act today**, **Decide this week**, **FYI** — streamed as the agent classifies each message. Success is measured by whether the founder finishes triage feeling they know exactly what to do today, without fear that something critical was buried.

**Planned surface:** A **landing/tutorial page** before the triage dashboard. It should onboard new users (how buckets work, why context matters) and present a clear **Choice A** visual direction for the product story — not a separate brand campaign site disconnected from the app.

## Brand Personality

**Calm · Sharp · Trusted**

- **Calm:** Reduce inbox anxiety; no alarmist UI or noisy AI chrome.
- **Sharp:** Decisive hierarchy, scannable structure, minimal copy.
- **Trusted:** Feels like a serious tool for high-stakes email, not a toy or demo.

**Reference feel (product UI):** Linear — dense but legible, quiet confidence, precise typography and spacing, restrained color.

## Anti-references

- **Generic Gmail/Gemini AI summaries:** Blob paragraphs, undifferentiated priority, "here's a summary" with no point of view.
- **Playful startup illustration style:** Mascots, bubbly gradients, whimsical empty states that undermine trust.
- **Dark hacker/terminal aesthetic:** Neon-on-black, monospace hero metrics, faux-technical posturing.
- **SaaS dashboard cliché:** Purple gradient heroes, identical icon+title card grids, glassmorphism cards, side-stripe accent borders.

## Design Principles

1. **Context before classification.** The product's differentiator is founder-specific context driving triage — the UI must make context visible, editable, and clearly influencing results.
2. **Buckets are decisions, not folders.** Act / Decide / FYI are commitment levels, not arbitrary labels. Every screen element should reinforce what action each bucket implies.
3. **Show the work, don't narrate it.** Prefer structured signals (priority, intent, suggested actions) over long prose summaries.
4. **Protect deep work.** Default to calm density and low motion; surface urgency only where the data supports it.
5. **Practice what you preach.** The interface itself should exemplify the clarity and prioritization the product promises for email.

## Accessibility & Inclusion

- **Target:** WCAG 2.1 AA for shipped UI (contrast, focus states, keyboard access, semantic structure).
- **Motion:** Respect `prefers-reduced-motion`; avoid layout-shifting animation for core triage flow.
- **Copy:** Clear labels for buckets, streaming states, and errors; no reliance on color alone for priority.

## Surfaces (for impeccable routing)

| Surface | Register | Notes |
|--------|----------|--------|
| Triage dashboard (`consolidated_project/frontend`) | product | Primary workflow; Linear-inspired calm/sharp system |
| Landing / tutorial (planned, pre-dashboard) | brand | Onboarding story + **Choice A** design direction; tutorial-first, then hand off to app |

When working on the landing page, treat it as **brand** register unless the task explicitly asks for product-register continuity.
