"use client";

import { BucketColumn } from "@/components/BucketColumn";
import type { Email, PartialTriageResult } from "@/lib/types";

const DEMO_EMAILS: Record<string, Email> = {
  "demo-act": {
    id: "demo-act",
    thread_id: "t1",
    sender_name: "Priya Raman",
    sender_email: "priya@bessemer.com",
    subject: "Re: Q3 numbers for Monday partner meeting",
    body: "Investor follow-up on ARR and burn before partner meeting.",
    received_at: new Date(Date.now() - 11 * 86400000).toISOString(),
    unread: true,
  },
  "demo-decide": {
    id: "demo-decide",
    thread_id: "t2",
    sender_name: "Jordan Patel",
    sender_email: "jpatel@acme.com",
    subject: "Pilot MSA — redline on clause 4.2",
    body: "Legal wants alignment on data retention before Friday sign.",
    received_at: new Date(Date.now() - 86400000).toISOString(),
    unread: true,
  },
  "demo-fyi": {
    id: "demo-fyi",
    thread_id: "t3",
    sender_name: "Stripe",
    sender_email: "receipts@stripe.com",
    subject: "Your receipt from Stripe — $247.00",
    body: "Payment received.",
    received_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    unread: false,
  },
};

const ACT_RESULT: PartialTriageResult = {
  email_id: "demo-act",
  done: true,
  signal: {
    intent: "deal",
    priority: 92,
    bucket: "act_today",
    reason: "Investor thread buried 11 days — partner meeting Monday.",
  },
  summary:
    "Bessemer follow-up needs Q3 figures before Monday. Reply today or risk losing momentum.",
  actions: [{ kind: "reply", label: "Send rough Q3 metrics", due_hint: "today" }],
};

const DECIDE_RESULT: PartialTriageResult = {
  email_id: "demo-decide",
  done: true,
  signal: {
    intent: "customer",
    priority: 68,
    bucket: "decide_this_week",
    reason: "Enterprise pilot blocked on MSA clause — not same-day urgent.",
  },
  summary:
    "Acme legal flagged data retention in the pilot MSA. Block time to review redlines this week.",
  actions: [{ kind: "decide", label: "Review clause 4.2 redline" }],
};

const FYI_RESULT: PartialTriageResult = {
  email_id: "demo-fyi",
  done: true,
  signal: {
    intent: "vendor",
    priority: 12,
    bucket: "fyi",
    reason: "Routine billing receipt — no action required.",
  },
  summary: "Stripe receipt for $247. File or ignore.",
  actions: [{ kind: "archive", label: "Archive receipt" }],
};

export function LandingProductPreview() {
  return (
    <div
      className="relative w-full max-w-lg mx-auto lg:mx-0 lg:ml-auto pointer-events-none select-none"
      role="img"
      aria-label="Preview of the triage dashboard showing Act today, Decide this week, and FYI buckets with sample emails"
    >
      <div className="rounded-2xl border border-line bg-surface shadow-edge-lg ring-1 ring-ink/5 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-line bg-paper-deep">
          <span className="w-2.5 h-2.5 rounded-full bg-accent/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-decide/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-line-strong" />
          <span className="ml-2 eyebrow text-muted truncate">
            Email Triage · demo inbox
          </span>
        </div>
        <div className="p-3 sm:p-4 space-y-3 max-h-[min(28rem,52vh)] overflow-hidden bg-paper">
          <BucketColumn
            title="Act today"
            subtitle="Time-critical. Reply or decide now."
            eyebrow="bucket 01 · now"
            accent="act"
            results={[ACT_RESULT]}
            emails={DEMO_EMAILS}
            empty="Nothing burning."
          />
          <BucketColumn
            title="Decide this week"
            subtitle="Important, not urgent."
            eyebrow="bucket 02 · this week"
            accent="decide"
            results={[DECIDE_RESULT]}
            emails={DEMO_EMAILS}
            empty="No pending decisions."
          />
          <BucketColumn
            title="FYI"
            subtitle="Skim only if you want."
            eyebrow="bucket 03 · fyi"
            accent="fyi"
            results={[FYI_RESULT]}
            emails={DEMO_EMAILS}
            empty="Nothing to skim."
            defaultExpanded={false}
          />
        </div>
      </div>
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-paper to-transparent rounded-b-2xl"
      />
    </div>
  );
}
