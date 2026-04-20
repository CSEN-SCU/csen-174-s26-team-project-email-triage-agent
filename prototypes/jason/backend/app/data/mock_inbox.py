"""Seeded inbox modeled on the Maya Chen storyboard persona.

Eleven emails spanning investor, customer, recruiting, vendor, partnership,
and cold outreach — the mix a seed-stage technical founder actually faces.
The buried-11-days Bessemer thread is the 'Oh Crap' moment from Frame 3.
"""
from datetime import datetime, timedelta, timezone

from app.models.email import Email

_now = datetime.now(timezone.utc)


def _t(days: float) -> datetime:
    return _now - timedelta(days=days)


MOCK_EMAILS: list[Email] = [
    Email(
        id="e1",
        thread_id="t1",
        sender_name="Priya Raman",
        sender_email="priya@bessemer.com",
        subject="Re: Following up — Q3 numbers for Monday partner meeting",
        body=(
            "Hi Maya,\n\nJust re-pinging on this — I'd love to share your Q3 "
            "numbers at our partner meeting Monday. Even rough figures on ARR, "
            "burn, and pilot conversion would be great. Happy to hop on a 15-min "
            "call tomorrow if easier.\n\nBest,\nPriya"
        ),
        received_at=_t(11),
    ),
    Email(
        id="e2",
        thread_id="t2",
        sender_name="Jordan Patel (Acme Corp Legal)",
        sender_email="jpatel@acme.com",
        subject="Pilot MSA — redline on clause 4.2",
        body=(
            "Maya, our legal team has flagged clause 4.2 (data retention) in the "
            "pilot MSA. We'd like to cap retention at 30 days post-termination "
            "and add a deletion certification requirement. Redlined doc attached. "
            "Can we get alignment this week so we can sign by Friday?"
        ),
        received_at=_t(1.2),
    ),
    Email(
        id="e3",
        thread_id="t3",
        sender_name="Sam Liu",
        sender_email="sam@cofounder.internal",
        subject="Demo flow — which path do we show tomorrow?",
        body=(
            "Hey — for the YC demo tomorrow, should we lead with the eval "
            "dashboard or the agent trace viewer? I lean trace viewer because "
            "it's more visually striking, but dashboard is what investors keep "
            "asking about. Your call."
        ),
        received_at=_t(0.3),
    ),
    Email(
        id="e4",
        thread_id="t4",
        sender_name="Recruiter Bot",
        sender_email="outreach@talentflow.io",
        subject="Senior ML engineers available this week",
        body="We have 50+ pre-vetted ML engineers. Reply STOP to unsubscribe.",
        received_at=_t(0.5),
    ),
    Email(
        id="e5",
        thread_id="t5",
        sender_name="Stripe",
        sender_email="receipts@stripe.com",
        subject="Your receipt from Stripe — $247.00",
        body="Payment received. View invoice in your dashboard.",
        received_at=_t(2),
    ),
    Email(
        id="e6",
        thread_id="t6",
        sender_name="Ravi Shah",
        sender_email="ravi@ycbatchmate.co",
        subject="Intro: you <> Kira at Anthropic (partnership)",
        body=(
            "Maya — Kira runs the startup partnerships program at Anthropic. "
            "She'd love to chat about credits and co-marketing given what you're "
            "building. Cc'ing her here. Take it away!"
        ),
        received_at=_t(3),
    ),
    Email(
        id="e7",
        thread_id="t7",
        sender_name="Dana Kim",
        sender_email="dana@pilotco.com",
        subject="URGENT: agent returned wrong customer record in prod",
        body=(
            "Maya, we just had our agent return customer record #4412 for a "
            "query that was clearly about #4418. This is the second time this "
            "week. If this keeps happening we need to pause the pilot. Can "
            "someone on your team look today?"
        ),
        received_at=_t(0.15),
    ),
    Email(
        id="e8",
        thread_id="t8",
        sender_name="Alex Founder",
        sender_email="alex@anotherstartup.com",
        subject="Quick question — how did you handle eval infra?",
        body=(
            "Hey Maya, fellow YC founder here. Saw your tweet about evals. "
            "Mind sharing what stack you use? Happy to return the favor."
        ),
        received_at=_t(4),
    ),
    Email(
        id="e9",
        thread_id="t9",
        sender_name="Marcus Chen",
        sender_email="m.chen@indexventures.com",
        subject="Enjoyed the demo — next steps?",
        body=(
            "Maya, great chat last Thursday. I've shared the deck internally "
            "and there's genuine interest. Could we get 30 min with you and "
            "Sam next week to go deeper on the eval methodology? Also — any "
            "customer references we could speak with?"
        ),
        received_at=_t(2.5),
    ),
    Email(
        id="e10",
        thread_id="t10",
        sender_name="AWS Billing",
        sender_email="no-reply@aws.com",
        subject="Your AWS bill for April is $3,241.18",
        body="See attached invoice. Due date: May 5.",
        received_at=_t(1),
    ),
    Email(
        id="e11",
        thread_id="t11",
        sender_name="Crypto Opportunities",
        sender_email="winner@totally-legit.xyz",
        subject="You've been selected! Claim your 5 ETH",
        body="Click here to claim your reward before it expires...",
        received_at=_t(0.8),
    ),
]


DEFAULT_USER_CONTEXT = (
    "I'm Maya, CEO of a 4-person seed-stage AI startup. Right now I'm raising "
    "a seed extension, running two enterprise pilots (Acme Corp and PilotCo), "
    "and hiring a founding engineer. My time goes furthest when I'm shipping "
    "product, so I want email triage that protects deep work but never drops "
    "investor follow-ups or customer-critical issues."
)
