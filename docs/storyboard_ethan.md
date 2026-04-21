# Storyboard: Email Triage Agent

**Date:** 2026-04-20  
**Source:** `docs/product-vision.md`  
**Format:** Classic 6-frame narrative arc (Main Character → Problem → "Oh Crap" → Solution → "Aha" → Life After)

---

## Main Character (grounding assumption)

**John, 20** — junior CS major running a nights-and-weekends startup with two classmates. Between lectures, problem sets, and a part-time campus job, his inbox is a mashup of **school** (TA threads, registration, club lists), **life** (rent, family), and **the company** (a campus accelerator, a design partner at a local nonprofit, a scrappy legal-clinic intake, teammate handoffs, and endless “quick sync?” invites). He’s sharp at building; he’s drowning in **deciding** what email can wait until after midterms and what will quietly wreck the startup if it slips.

> *Why this persona:* The product vision centers **entrepreneurs** who must **balance time with the ability to respond to and track important email**. A student founder is that tension turned up—same coordination load, far less margin, and one inbox that refuses to separate “quiz reminder” from “pilot feedback.”

---

## The 6 Frames

### Frame 1 — Meet John

**Narrative:**  
It’s Wednesday, 11:40 AM. John slips out of lecture and opens his laptop on a bench outside the engineering building. **Unread: 187.** Half his brain is still on the proof due at midnight. The other half knows the startup has three live threads: the nonprofit pilot wants a revised scope, the accelerator coach asked for a one-pager “whenever,” and his teammate forwarded a Stripe dispute he hasn’t read. Everything in the list **looks** the same weight—bold subjects, red dots, newsletters dressed up as updates.

**Visual (fat-marker sketch):**  
John with a backpack at his feet, laptop on knees, mail app a wall of senders: *Registrar*, *Campus Hackathon*, *Design Partner — Re: scope*, *Mom Fwd: taxes*. No obvious hierarchy. Lecture hall or brutalist building in the background.

**Mood:** Smart, stretched thin, already bracing for another “I’ll triage tonight” spiral.

---

### Frame 2 — The Problem Emerges

**Narrative:**  
John tries to cope. Stars, filters, a Gemini panel in Gmail that says a long thread is “discussing scheduling”—true, irrelevant. It doesn’t know that *his* world runs on **pilot replies before the partner loses patience**, **accelerator deadlines that aren’t on the syllabus**, and **team accountability that happens entirely over email** between classes. He burns 45 minutes between labs and ends with more tabs open, more guilt, and the same fear: something important is hiding in the noise.

**Visual:**  
Split panel: John squinting at a generic AI blurb (“This email is about a meeting.”) next to a notebook margin scribble: *pilot · demo · midterm Thu*. Arrows don’t connect.

**Mood:** Frustrated, scattered—**time** and **judgment** are misaligned.

---

### Frame 3 — The "Oh Crap" Moment

**Narrative:**  
Friday, 4:18 PM, right before he was going to finally start the problem set. A Slack from his teammate: *“Dude—did you send the signed pilot addendum? They said legal needed it by **today** for Monday’s kickoff.”* John’s stomach drops. The request is in his inbox—**22 messages down** in a chain that started as “coffee next week?”, buried under a career-fair blast and a thread titled “Re: Re: Fwd: invoice.” He had the PDF; he never surfaced the deadline in *his* real calendar. He realizes he didn’t fail because he didn’t care—he failed because **nothing prioritized “this kills the pilot”** against the rest of his life.

**Visual:**  
John, hand on forehead, Slack glow on his face. Email thread visible with *addendum* and a timestamp from days ago. Red accent on *today* and *Monday kickoff*.

**Mood:** Panic, embarrassment—the kind that hits when **school brain and founder brain** collide.

---

### Frame 4 — The Solution Appears

**Narrative:**  
That night, his accelerator buddy texts a link: *“Email Triage Agent—we’re testing it. It actually asks what you’re juggling.”* John expects another gimmick, but the pitch matches the vision: **not a generic chat in Gmail**, but a **SaaS layer** with **natural language understanding**, **intent classification**, **priority scoring**, **semantic summarization**, and **workflow automation**—meant to adapt to **his workflows and context**. He connects his inbox and answers honestly in plain language: *student founder, nonprofit pilot, small team, midterms this month, accelerator cohort.* The product asks what a “win” looks like this week. He types: *ship pilot, don’t flame out of school.*

**Visual:**  
John at a cluttered desk (textbooks + sticker-covered water bottle), laptop showing a short onboarding prompt: *What are you optimizing for right now?*

**Mood:** Skeptical hope. *“If this is just smarter spam filters, I’m done.”*

---

### Frame 5 — The "Aha" Moment

**Narrative:**  
Saturday morning, John opens email and doesn’t start with chaos. He sees a **ranked queue** tuned to *him*: *Pilot — Riverfront Arts: signed addendum due today (legal blocker)* at the top, with a **tight summary** of the thread and a **suggested next step** (“Attach PDF; CC teammate; confirm Monday kickoff”). Below: *Accelerator: one-pager request idle 5 days* and *School: TA office hours moved*—separated so **startup stakes** don’t drown in campus noise. The tool isn’t saying “this email discusses a project”; it’s encoding **what he said matters** this month.

He sends the addendum, pings the partner, closes the laptop, and actually breathes. Email feels like **a system**, not a personality test.

**Visual:**  
Story shorthand for three cards—top pilot card highlighted with a one-line “why now.” John’s shoulders drop; small “sent” confirmation.

**Mood:** Relief, trust, **personalization as calm**.

---

### Frame 6 — Life After

**Narrative:**  
A few weeks later, John still gets hammered with mail—but **the right startup threads surface early**, and the rest waits in a sane backlog. The pilot kicks off; the accelerator coach stops chasing him; he stops losing Tuesdays to inbox archaeology. He’s not chasing inbox zero for sport—he’s **reliable to teammates and partners** while still making lecture and sleep. The agent holds the map in **his** context: student schedule, founder deadlines, not a generic “professional” inbox.

**Visual:**  
John in the library or a makerspace, IDE or slides in focus. Phone/laptop shows a small *attention queue: 2 items*—not a red badge storm. Backpack, coffee, daylight.

**Mood:** Balanced agency—**school and startup both get their due**.

---

## Visual Style (default)

Fat-marker sharpie sketches—black ink on white, minimal color. One accent color (cool blue or teal) for “calm focus” on Frames 5–6; stressed red only on Frame 3. Hand-lettered frame titles. Loose and human—story, not UI spec.

---

## Self-Test (from the storyboard skill)

| Question | Status |
|----------|--------|
| Is John relatable to student founders juggling classes and a company? | Yes—swap school details (major, program) to match your audience. |
| Is the problem visceral in Frames 2–3? | Yes—generic AI summary vs. buried legal addendum on pilot eve. |
| Is the "Oh Crap" moment authentic? | Yes—missed “legal by EOD” is a concrete early-startup failure mode. |
| Is the solution introduction natural? | Yes—peer text from someone in the same accelerator orbit. |
| Is the "Aha" believable? | Yes—prioritized queue separates pilot stakes from campus noise. |
| Is Frame 6 aspirational and concrete? | Yes—reliable to partners without sacrificing school; context-aware triage. |

---

## Traceability to `docs/product-vision.md`

| Vision line | Where it shows up |
|---------------|-------------------|
| Entrepreneurs balancing time vs. tracking important email | Frames 1–2, 6 |
| SaaS platform | Frame 4 (product as dedicated layer) |
| Organize, prioritize, surface actionable insight | Frames 5–6 |
| Unlike Gemini in Gmail — generic | Frames 2, 5 (contrast) |
| Adapts to workflows, business context, decision patterns | Frames 4–5 |
| NLU, intent, priority, summarization, automation | Frame 4 (named); Frame 5 (embodied in outcome) |
