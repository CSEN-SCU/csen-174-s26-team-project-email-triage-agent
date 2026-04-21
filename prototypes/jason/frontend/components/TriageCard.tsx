"use client";

import { useState } from "react";
import type { Email, PartialTriageResult, Stage } from "@/lib/types";

const intentLabel: Record<string, string> = {
  investor: "Investor",
  customer: "Customer",
  partnership: "Partnership",
  recruiting: "Recruiting",
  vendor: "Vendor",
  internal: "Internal",
  cold_outreach: "Cold outreach",
  other: "Other",
};

function PriorityDot({ value }: { value: number }) {
  const color =
    value >= 80 ? "bg-accent" : value >= 40 ? "bg-yellow-500" : "bg-muted/60";
  return <span className={`inline-block w-2 h-2 rounded-full ${color}`} />;
}

function StagePill({ stage, done }: { stage?: Stage; done?: boolean }) {
  if (done) return null;
  const label =
    stage === "summarize"
      ? "summarizing…"
      : stage === "actions"
      ? "extracting actions…"
      : stage === "draft"
      ? "drafting reply…"
      : "classifying…";
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-accent bg-accent/10 px-2 py-0.5 rounded-full">
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
      {label}
    </span>
  );
}

export function TriageCard({
  result,
  email,
}: {
  result: PartialTriageResult;
  email?: Email;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasDraft = !!result.draft_reply;
  const signal = result.signal;

  return (
    <article className="bg-white border border-line rounded-2xl p-5 card-edge">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted mb-1 flex-wrap">
            {signal && <PriorityDot value={signal.priority} />}
            {signal && (
              <>
                <span className="uppercase tracking-wide">
                  {intentLabel[signal.intent]}
                </span>
                <span>·</span>
                <span>priority {signal.priority}</span>
              </>
            )}
            <StagePill stage={result.stage} done={result.done} />
          </div>
          <h3 className="font-serif text-lg leading-snug truncate">
            {email?.subject ?? result.email_id}
          </h3>
          {email && (
            <p className="text-xs text-muted mt-0.5 truncate">
              from {email.sender_name} &lt;{email.sender_email}&gt;
            </p>
          )}
        </div>
      </header>

      {result.summary ? (
        <p className="mt-3 text-sm leading-relaxed">{result.summary}</p>
      ) : (
        <p className="mt-3 text-sm leading-relaxed text-muted italic">
          waiting for summary…
        </p>
      )}

      {signal?.reason && (
        <p className="mt-2 text-xs italic text-muted">{signal.reason}</p>
      )}

      {result.actions && result.actions.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {result.actions.map((a, i) => (
            <li key={i} className="text-sm flex items-start gap-2">
              <span className="text-accent mt-[2px]">▸</span>
              <span>
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
            className="text-sm text-accent hover:underline"
          >
            {expanded ? "Hide draft reply" : "View draft reply"}
          </button>
          {expanded && (
            <div className="mt-3 bg-paper/60 border border-line rounded-lg p-3 text-sm whitespace-pre-wrap leading-relaxed">
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
