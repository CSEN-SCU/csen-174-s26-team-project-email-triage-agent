"use client";

import { useState } from "react";
import type { Email, PartialTriageResult, Stage } from "@/lib/types";

type Accent = "act" | "decide" | "fyi";

const INTENT_LABEL: Record<string, string> = {
  prospect: "Prospect",
  deal: "Deal",
  customer: "Customer",
  partnership: "Partnership",
  vendor: "Vendor",
  internal: "Internal",
  cold_outreach: "Cold outreach",
  other: "Other",
};

const PRIORITY_LABEL = (v: number) =>
  v >= 80 ? "high" : v >= 40 ? "medium" : "low";

function PriorityBar({ value }: { value: number }) {
  const filled = Math.max(2, Math.min(100, value));
  return (
    <div
      className="relative h-1 w-16 rounded-full bg-line overflow-hidden"
      aria-label={`priority ${value}`}
    >
      <span
        className="absolute inset-y-0 left-0 bg-ink rounded-full"
        style={{ width: `${filled}%` }}
      />
    </div>
  );
}

function StagePill({ stage, done }: { stage?: Stage; done?: boolean }) {
  if (done) return null;
  const label =
    stage === "summarize"
      ? "summarizing"
      : stage === "actions"
        ? "extracting actions"
        : stage === "draft"
          ? "drafting reply"
          : "classifying";
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-eyebrow text-accent bg-accent/10 px-2 py-0.5 rounded-full">
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" />
      {label}
    </span>
  );
}

export function TriageCard({
  result,
  email,
  accent = "act",
}: {
  result: PartialTriageResult;
  email?: Email;
  accent?: Accent;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasDraft = !!result.draft_reply;
  const signal = result.signal;

  const accentTone =
    accent === "act"
      ? "text-accent"
      : accent === "decide"
        ? "text-decide"
        : "text-ink-soft";

  return (
    <article className="surface card-edge p-5 transition hover:shadow-edge-lg">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs text-muted mb-2 flex-wrap">
            {signal && (
              <>
                <PriorityBar value={signal.priority} />
                <span className="uppercase tracking-eyebrow text-[10px] text-ink-soft">
                  {INTENT_LABEL[signal.intent] ?? signal.intent}
                </span>
                <span aria-hidden>·</span>
                <span className="tabular-nums">
                  {PRIORITY_LABEL(signal.priority)} · {signal.priority}
                </span>
              </>
            )}
            <StagePill stage={result.stage} done={result.done} />
          </div>
          <h3 className="font-serif text-lg leading-snug text-ink truncate">
            {email?.subject ?? result.email_id}
          </h3>
          {email && (
            <p className="text-xs text-muted mt-1 truncate">
              <span className="text-ink-soft">{email.sender_name}</span>{" "}
              <span className="text-muted/70">·</span>{" "}
              <span className="font-mono text-[11px]">{email.sender_email}</span>
            </p>
          )}
        </div>
      </header>

      {result.summary ? (
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
          {result.summary}
        </p>
      ) : (
        <p className="mt-3 text-sm leading-relaxed text-muted italic">
          waiting for summary…
        </p>
      )}

      {signal?.reason && (
        <p className="mt-2 text-xs italic text-muted leading-relaxed">
          {signal.reason}
        </p>
      )}

      {result.actions && result.actions.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {result.actions.map((a, i) => (
            <li key={i} className="text-sm flex items-start gap-2 text-ink-soft">
              <span className={`mt-[2px] ${accentTone}`} aria-hidden>
                ▸
              </span>
              <span className="flex-1">
                {a.label}
                {a.due_hint && (
                  <span className="text-muted text-xs ml-2">({a.due_hint})</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      {hasDraft && (
        <div className="mt-4 border-t border-line pt-3">
          <button
            onClick={() => setExpanded((v) => !v)}
            className={`text-sm hover:underline ${accentTone}`}
          >
            {expanded ? "Hide draft reply" : "View draft reply →"}
          </button>
          {expanded && (
            <div className="mt-3 bg-paper-deep/60 border border-line rounded-lg p-4 text-sm whitespace-pre-wrap leading-relaxed text-ink-soft font-serif animate-fade-in">
              {result.draft_reply}
            </div>
          )}
        </div>
      )}

      {result.error && (
        <p className="mt-3 text-xs text-red-700">error: {result.error}</p>
      )}
    </article>
  );
}
