"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import type {
  Email,
  PartialTriageResult,
  Stage,
  SubmitStatus,
} from "@/lib/types";
import { canSubmitDraft } from "@/lib/triage-helpers";

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
      className="relative h-1 w-16 rounded-full bg-hairline overflow-hidden"
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
    <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-eyebrow text-steel bg-surface px-2 py-0.5 rounded-notion border border-hairline">
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-ink animate-pulse-soft" />
      {label}
    </span>
  );
}

export function TriageCard({
  result,
  email,
  accent = "act",
  canSend = false,
}: {
  result: PartialTriageResult;
  email?: Email;
  accent?: Accent;
  canSend?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [body, setBody] = useState("");
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const hasDraft = !!result.draft_reply;
  const signal = result.signal;

  const accentTone =
    accent === "act"
      ? "text-act"
      : accent === "decide"
        ? "text-decide"
        : "text-stone";

  function openDraft() {
    if (!expanded && submitStatus === "idle") {
      setBody(result.draft_reply ?? "");
    }
    setExpanded((v) => !v);
  }

  async function handleSend() {
    if (!email) return;
    setSubmitStatus("sending");
    setSubmitError(null);
    try {
      await api.sendReply(email.id, body);
      setSubmitStatus("sent");
    } catch (e) {
      setSubmitStatus("error");
      setSubmitError(e instanceof Error ? e.message : String(e));
    }
  }

  async function handleSaveDraft() {
    if (!email) return;
    setSubmitStatus("saving");
    setSubmitError(null);
    try {
      await api.saveDraft(email.id, body);
      setSubmitStatus("saved");
    } catch (e) {
      setSubmitStatus("error");
      setSubmitError(e instanceof Error ? e.message : String(e));
    }
  }

  const locked = submitStatus === "sent" || submitStatus === "saved";
  const inFlight = submitStatus === "sending" || submitStatus === "saving";
  const canSubmit = canSubmitDraft({ canSend, body, status: submitStatus });

  return (
    <article className="surface card-edge p-5 transition hover:shadow-edge-lg">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs text-muted mb-2 flex-wrap">
            {signal && (
              <>
                <PriorityBar value={signal.priority} />
                <span className="uppercase tracking-eyebrow text-[10px] text-charcoal">
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
          <h3 className="text-heading-4 leading-snug text-ink truncate">
            {email?.subject ?? result.email_id}
          </h3>
          {email && (
            <p className="text-xs text-muted mt-1 truncate">
              <span className="text-charcoal">{email.sender_name}</span>{" "}
              <span className="text-muted/70">·</span>{" "}
              <span className="font-mono text-[11px]">{email.sender_email}</span>
            </p>
          )}
        </div>
      </header>

      {result.summary ? (
        <p className="mt-3 text-[15px] leading-relaxed text-charcoal">
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
            <li key={i} className="text-sm flex items-start gap-2 text-charcoal">
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
        <div className="mt-4 border-t border-hairline pt-3">
          <button
            onClick={openDraft}
            className={`text-sm hover:underline ${accentTone}`}
          >
            {expanded ? "Hide draft reply" : "View draft reply →"}
          </button>
          {expanded && (
            <div className="mt-3 animate-fade-in">
              {locked ? (
                <div className="bg-surface border border-hairline rounded-notion p-4 text-sm whitespace-pre-wrap leading-relaxed text-charcoal">
                  {body}
                </div>
              ) : (
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  disabled={inFlight}
                  rows={6}
                  aria-label="Edit draft reply"
                  className="w-full bg-surface border border-hairline rounded-notion p-4 text-sm leading-relaxed text-charcoal resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 disabled:opacity-60"
                />
              )}

              <div className="mt-3 flex flex-wrap items-center gap-3">
                {locked ? (
                  <span className={`text-sm font-medium ${accentTone}`}>
                    {submitStatus === "sent" ? "Sent ✓" : "Saved to Gmail ✓"}
                  </span>
                ) : (
                  <>
                    <button
                      onClick={handleSend}
                      disabled={!canSubmit}
                      className="btn-primary disabled:opacity-50"
                    >
                      {submitStatus === "sending" ? "Sending…" : "Send"}
                    </button>
                    <button
                      onClick={handleSaveDraft}
                      disabled={!canSubmit}
                      className="btn-secondary disabled:opacity-50"
                    >
                      {submitStatus === "saving" ? "Saving…" : "Save as Gmail draft"}
                    </button>
                    {!canSend && (
                      <span className="text-xs text-muted">
                        Connect Gmail to send
                      </span>
                    )}
                  </>
                )}
              </div>

              {submitError && (
                <p className="mt-2 text-xs text-red-700">error: {submitError}</p>
              )}
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
