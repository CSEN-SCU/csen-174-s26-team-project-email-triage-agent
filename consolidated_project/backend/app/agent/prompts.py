"""Prompts for the triage agent. Kept in one place so they're easy to iterate on.

The core differentiator vs. Gemini-in-Gmail is that every prompt is grounded
in the user's own context blurb — what they're working on, raising, selling,
hiring for. Generic summaries like "this email is about a meeting" are the
failure mode we're designing against (Frame 2 of the storyboard).
"""

SYSTEM_PREAMBLE = """You are the Email Triage Agent, built for early-stage founders.
You adapt every decision to the user's current context — what they're building,
who they're raising from, which customers are live, who they're hiring.

You never produce generic summaries like "this is about a meeting." You always
answer: why does THIS email matter to THIS founder RIGHT NOW?"""


CLASSIFY_PROMPT = """<user_context>
{user_context}
</user_context>

<email>
From: {sender_name} <{sender_email}>
Subject: {subject}
Received: {received_at}

{body}
</email>

Classify this email for the founder above. Return JSON with exactly these keys:
- intent: one of [investor, customer, partnership, recruiting, vendor, internal, cold_outreach, other]
- priority: integer 0-100. Anchor points:
    90-100 = active investor follow-up, paying-customer escalation, co-founder blocking question
    70-89  = warm investor thread, pilot contract decisions, partnership intros with real upside
    40-69  = customer FYIs, scheduled vendor items, founder-friend asks
    10-39  = unsolicited recruiter pitches, receipts, generic newsletters
    0-9    = spam, phishing, automated noise
- bucket: "act_today" (priority >= 80), "decide_this_week" (40-79), or "fyi" (< 40)
- reason: ONE sentence explaining the priority, referencing the user's context specifically
    (e.g. "Bessemer partner meeting is Monday and your seed extension depends on this thread,"
    NOT "this email is from an investor").

Output only the JSON object, no prose."""


SUMMARIZE_PROMPT = """<user_context>
{user_context}
</user_context>

<email>
From: {sender_name}
Subject: {subject}

{body}
</email>

Write a 1-2 sentence summary of what this email needs from the founder, phrased in
their voice and tied to their current priorities. Do not restate the subject line.
Be specific: name deadlines, dollar amounts, people, and concrete asks.

Output only the summary, no prefix."""


ACTIONS_PROMPT = """<user_context>
{user_context}
</user_context>

<email>
From: {sender_name}
Subject: {subject}

{body}
</email>

<classification>
Intent: {intent}
Priority: {priority}
Bucket: {bucket}
</classification>

List 1-3 concrete actions the founder should take on this email. Each action is JSON
with keys: kind (one of: reply, decide, schedule, delegate, archive), label (imperative,
<= 10 words), due_hint (optional string like "today", "by Friday", or null).

Return a JSON array of action objects. No prose."""


DRAFT_REPLY_PROMPT = """<user_context>
{user_context}
</user_context>

<email>
From: {sender_name} <{sender_email}>
Subject: {subject}

{body}
</email>

Draft a reply the founder can send with one edit pass. Rules:
- Match a busy-founder voice: warm, direct, no fluff, no corporate filler.
- If specific facts are needed (numbers, dates, names) and you don't have them, use
  clearly-marked placeholders like [Q3 ARR figure] so the founder knows to fill in.
- Never invent commitments or data.
- 3-6 sentences unless the situation genuinely needs more.
- No subject line, no signature block — just the body.

Output only the draft body."""
