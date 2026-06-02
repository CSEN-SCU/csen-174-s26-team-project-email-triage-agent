"use client";

import { useEffect, useState } from "react";
import { BucketColumn } from "@/components/BucketColumn";
import type { Email, TriageResult } from "@/lib/types";

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

const ACT_RESULT: TriageResult = {
  email_id: "demo-act",
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

const DECIDE_RESULT: TriageResult = {
  email_id: "demo-decide",
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

const FYI_RESULT: TriageResult = {
  email_id: "demo-fyi",
  signal: {
    intent: "vendor",
    priority: 12,
    bucket: "fyi",
    reason: "Routine billing receipt — no action required.",
  },
  summary: "Stripe receipt for $247. File or ignore.",
  actions: [{ kind: "archive", label: "Archive receipt" }],
};

const PREVIEW_SLIDES = [
  {
    key: "act",
    label: "Act today",
    eyebrow: "bucket 01 · now",
    accent: "act" as const,
    subtitle: "Time-critical. Reply or decide now.",
    results: [ACT_RESULT],
    empty: "Nothing burning.",
  },
  {
    key: "decide",
    label: "Decide this week",
    eyebrow: "bucket 02 · this week",
    accent: "decide" as const,
    subtitle: "Important, not urgent.",
    results: [DECIDE_RESULT],
    empty: "No pending decisions.",
  },
  {
    key: "fyi",
    label: "FYI",
    eyebrow: "bucket 03 · fyi",
    accent: "fyi" as const,
    subtitle: "Skim only if you want.",
    results: [FYI_RESULT],
    empty: "Nothing to skim.",
  },
] as const;

function reelPosition(index: number, activeIndex: number, total: number): -1 | 0 | 1 {
  const delta = (index - activeIndex + total) % total;
  if (delta === 0) return 0;
  if (delta === 1) return 1;
  return -1;
}

export function LandingProductPreview() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % PREVIEW_SLIDES.length);
    }, 3200);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div
      className="landing-preview-reel relative w-full pointer-events-none select-none"
      role="img"
      aria-label={`Preview of the triage dashboard cycling through ${PREVIEW_SLIDES[activeIndex].label}, Decide this week, and FYI buckets with sample emails`}
    >
      <div className="rounded-card border border-hairline bg-canvas overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-hairline bg-surface">
          <span className="w-2.5 h-2.5 rounded-full bg-act/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-decide/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-hairline-strong" />
          <span className="ml-2 eyebrow text-steel truncate">
            Email Triage · preview inbox
          </span>
        </div>
        <div className="p-3 sm:p-4 bg-canvas">
          <div className="flex items-center gap-2 mb-4">
            {PREVIEW_SLIDES.map((slide, index) => {
              const active = index === activeIndex;
              return (
                <div key={slide.key} className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`text-[10px] uppercase tracking-[0.18em] truncate transition-colors duration-300 ${
                        active ? "text-ink" : "text-steel"
                      }`}
                    >
                      {slide.label}
                    </span>
                    <span
                      className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                        slide.accent === "act"
                          ? active
                            ? "bg-act"
                            : "bg-act/20"
                          : slide.accent === "decide"
                            ? active
                              ? "bg-decide"
                              : "bg-decide/20"
                            : active
                              ? "bg-fyi"
                              : "bg-fyi/20"
                      }`}
                    />
                  </div>
                  <div className="h-1 rounded-full bg-surface overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${
                        slide.accent === "act"
                          ? "bg-act/85"
                          : slide.accent === "decide"
                            ? "bg-decide/85"
                            : "bg-fyi/85"
                      } ${active ? "w-full opacity-100" : "w-0 opacity-40"}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="relative h-[28rem] sm:h-[30rem] [perspective:1600px]">
            <div className="absolute inset-0 rounded-card bg-gradient-to-b from-surface/65 via-transparent to-canvas pointer-events-none" />
            {PREVIEW_SLIDES.map((slide, index) => {
              const position = reelPosition(index, activeIndex, PREVIEW_SLIDES.length);
              const active = position === 0;

              const transform =
                position === 0
                  ? "translateX(-50%) translateZ(120px) rotateY(0deg) scale(1)"
                  : position === -1
                    ? "translateX(calc(-50% - 36%)) translateZ(-180px) rotateY(34deg) scale(0.84)"
                    : "translateX(calc(-50% + 36%)) translateZ(-180px) rotateY(-34deg) scale(0.84)";

              return (
                <div
                  key={slide.key}
                  className="absolute inset-y-2 left-1/2 w-[86%] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{
                    transform,
                    opacity: active ? 1 : 0.34,
                    zIndex: active ? 30 : position === -1 ? 20 : 10,
                    filter: active ? "none" : "saturate(0.82)",
                    transformStyle: "preserve-3d",
                  }}
                >
                  <div className="relative h-full">
                    <div
                      aria-hidden
                      className={`absolute inset-0 rounded-[1.35rem] transition-opacity duration-700 ${
                        active ? "opacity-0" : "opacity-100"
                      } bg-gradient-to-b from-canvas/25 via-canvas/12 to-canvas/80`}
                    />
                    <BucketColumn
                      title={slide.label}
                      subtitle={slide.subtitle}
                      eyebrow={slide.eyebrow}
                      accent={slide.accent}
                      results={[...slide.results]}
                      emails={DEMO_EMAILS}
                      empty={slide.empty}
                      defaultExpanded
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            {PREVIEW_SLIDES.map((slide, index) => {
              const active = index === activeIndex;
              return (
                <div
                  key={slide.key}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    active ? "w-10 bg-ink/80" : "w-4 bg-hairline-strong"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
