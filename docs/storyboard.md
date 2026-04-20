# Storyboard: Email Triage Agent

**Date:** 2026-04-20
**Source:** `docs/product-vision.md` + `docs/problem-framing-canvas.md`
**Format:** Classic 6-frame narrative arc (Main Character → Problem → "Oh Crap" → Solution → "Aha" → Life After)

---

## Main Character (grounding assumption)

**Maya Chen, 28** — technical co-founder and CEO of a 4-person seed-stage AI startup in San Francisco. Former ML engineer. Strong at building product; new to running investor conversations, customer pilots, and partnerships. Runs her company from a shared Gmail inbox that pulls in investor threads, customer support, recruiting, vendor invoices, and cold outreach all day.

> *Why this persona:* The problem framing canvas identifies "early-stage founders, especially technical founders who are less familiar with business processes" as the core user. Maya is a concrete instance — swap in your own if you have a sharper target.

---

## The 6 Frames

### Frame 1 — Meet Maya

**Narrative:**
It's 9:07 AM. Maya is at her standing desk with a second monitor showing her team's PR queue. She opens Gmail. **347 unread.** Investor updates, a customer escalation, three recruiter pitches, a Stripe receipt, a partnership intro from a YC batchmate, and her co-founder's question about the demo. She's been up since 6 shipping a model eval; email is the thing she does between the things she's actually good at.

**Visual (fat-marker sketch):**
Maya at her desk, headphones on, laptop open. On one screen: a terminal with green test output. On the other: a wall of bolded email subjects. A coffee cup. A Post-it that says "ship demo."

**Mood:** Capable, focused, but already behind on the inbox.

---

### Frame 2 — The Problem Emerges

**Narrative:**
Maya tries to triage. She stars anything that *looks* important, archives obvious noise, and tells herself she'll "do email properly tonight." Forty minutes later she's still scrolling. A Gemini summary at the top of one thread tells her the email is "about a meeting" — technically true, uselessly generic. She closes Gmail with 280 still unread and a vague dread that she missed something.

**Visual:**
Maya scrolling, scrolling, scrolling. Thought bubble: *"Was the Sequoia associate the one asking for the deck, or was that Index?"* A generic AI summary box reads: *"This thread discusses a potential meeting."*

**Mood:** Overwhelmed, mildly anxious, losing trust in her own inbox.

---

### Frame 3 — The "Oh Crap" Moment

**Narrative:**
It's Friday, 4:52 PM. Maya is debugging a training run when her phone buzzes. It's a Slack message from a board advisor: *"Hey — did you get back to Priya at Bessemer? She said she needed your Q3 numbers by end of week for the partner meeting Monday."* Maya's stomach drops. She searches her inbox. The email is there. It arrived **eleven days ago**, buried under an avalanche of cold recruiter outreach. The partner meeting is the one that would've unlocked their Series A intro.

**Visual:**
Maya's face half-lit by the laptop, phone in hand showing the advisor's message. On her screen, a found email with a timestamp *"11 days ago"* glowing. Background fades to red.

**Mood:** Panic, embarrassment, the specific dread of realizing a missed email just cost something real.

---

### Frame 4 — The Solution Appears

**Narrative:**
Monday morning, Maya's co-founder sends her a link: *"Try this — a friend at another YC company swears by it."* It's the **Email Triage Agent**. She skims the landing page: *"Built for founders. Understands your fundraise, your customers, your deadlines. Doesn't just summarize — it prioritizes."* She's skeptical — she's tried three "AI inbox" tools this year and they all felt like glorified filters — but she connects her Gmail and gives it the 60 seconds of context it asks for: *"I'm raising a seed extension, piloting with two enterprise customers, and hiring a founding engineer."*

**Visual:**
Maya on a couch with her laptop, a small setup wizard on screen. A single input field asking *"What are you working on right now?"* Her co-founder in the background giving a thumbs up.

**Mood:** Cautious optimism. "Okay, one more shot."

---

### Frame 5 — The "Aha" Moment

**Narrative:**
Tuesday, 8:30 AM. Maya opens her laptop and — instead of 347 unread — she sees a single screen with **three cards**:

1. **Act today:** *"Priya (Bessemer) re-pinged about Q3 numbers — draft attached, review and send."*
2. **Decide this week:** *"Acme Corp pilot contract: legal flagged clause 4.2. Your lawyer's suggested redline is below."*
3. **FYI:** *"42 recruiter pitches this week. Archived. Top 2 surfaced if you want to skim."*

There's a draft reply to Priya — the *right* tone, with her actual Q3 numbers pulled from a thread she'd forgotten. Maya reads it, edits one sentence, and hits send. The whole triage took **four minutes**.

**Visual:**
Clean three-card dashboard replacing the wall of emails from Frame 2. A big green checkmark animating on the Priya card. Maya exhales — a small, real smile.

**Mood:** Relief → trust → quiet delight. *"It actually gets what I'm working on."*

---

### Frame 6 — Life After

**Narrative:**
Six weeks later. Maya runs email twice a day — 10 minutes in the morning, 10 in the evening — and it *stays done*. Her Series A intros are warm, her pilot customers feel heard, and her co-founder noticed she's been in Slack less and in PRs more. At the next board meeting, the advisor who flagged the Priya miss says offhand, *"You've been sharper this quarter."* Maya doesn't mention the agent. She just nods and keeps shipping.

**Visual:**
Maya back at her standing desk. Terminal full of green tests. Gmail tab minimized to a tiny badge: **"0 needs attention."** Out the window: late afternoon light. She's leaving on time.

**Mood:** Grounded, in control, back to doing the work only she can do.

---

## Visual Style (default)

Fat-marker sharpie sketches — black ink on white, minimal color. One accent color (warm orange) used sparingly: on the "Oh Crap" moment (Frame 3) and the "Aha" checkmark (Frame 5). Hand-lettered frame titles. Loose, human, intentionally un-polished — this is a story, not a mockup.

---

## Self-Test (from the skill)

| Question | Status |
|---|---|
| Is Maya relatable to early-stage technical founders? | Likely yes — swap details if your target is later-stage or non-technical. |
| Is the problem visceral in Frames 2–3? | Yes — the 11-day-buried Bessemer email is a specific, named pain. |
| Is the "Oh Crap" moment authentic? | Yes — missed VC follow-up is a canonical founder nightmare. |
| Is the solution introduction natural? | Yes — peer referral from another YC founder, not a cold ad. |
| Is the "Aha" believable? | Yes — the agent's value is *prioritization + draft-ready reply*, not just summary (directly addressing the canvas's critique of Gemini). |
| Is Frame 6 aspirational and concrete? | Yes — "0 needs attention," back in PRs, board advisor notices. |

---

## What to adjust

Tell me which of these to change and I'll rewrite the relevant frames:

1. **Persona.** Maya = technical SF AI founder. Want a different archetype (solo bootstrapper, non-technical founder, later-stage operator)?
2. **Stakes in Frame 3.** I used "missed VC follow-up." Alternatives: dropped enterprise pilot, missed customer churn signal, missed co-founder conflict.
3. **"Aha" in Frame 5.** I showed a 3-card daily digest. Could instead show: a Slack-style notification, an inline Gmail overlay, or a weekly Monday briefing.
4. **Tone.** Currently grounded/realistic. Want it more playful? More dramatic? More enterprise/formal?
