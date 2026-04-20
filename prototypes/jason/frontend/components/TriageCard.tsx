"use client";

import { useState } from "react";
import type { Email, TriageResult } from "@/lib/types";

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

export function TriageCard({
  result,
  email,
}: {
  result: TriageResult;
  email?: Email;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasDraft = !!result.draft_reply;

  return (
    <article className="bg-white border border-line rounded-2xl p-5 card-edge">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted mb-1">
            <PriorityDot value={result.signal.priority} />
            <span className="uppercase tracking-wide">{intentLabel[result.signal.intent]}</span>
            <span>·</span>
            <span>priority {result.signal.priority}</span>
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

      <p className="mt-3 text-sm leading-relaxed">{result.summary}</p>

      <p className="mt-2 text-xs italic text-muted">{result.signal.reason}</p>

      {result.actions.length > 0 && (
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
    </article>
  );
}
