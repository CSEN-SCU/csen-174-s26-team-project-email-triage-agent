"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { BucketColumn } from "@/components/BucketColumn";
import { ContextCard } from "@/components/ContextCard";
import { SignInGate } from "@/components/SignInGate";
import { api } from "@/lib/api";
import type {
  Bucket,
  Email,
  PartialTriageResult,
  Stage,
} from "@/lib/types";

const STAGE_ORDER: Stage[] = ["classify", "summarize", "actions", "draft"];

export default function Home() {
  const { data: session, status } = useSession();
  const authed = !!session?.user;

  const [emails, setEmails] = useState<Email[]>([]);
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [results, setResults] = useState<Record<string, PartialTriageResult>>({});
  const [running, setRunning] = useState(false);
  const [total, setTotal] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    setEmailsLoading(true);
    setResults({});
    api
      .listEmails()
      .then((list) => setEmails(list))
      .catch((e) => setError(String(e)))
      .finally(() => setEmailsLoading(false));
  }, [status, authed]);

  const emailsById = useMemo(() => {
    const m: Record<string, Email> = {};
    for (const e of emails) m[e.id] = e;
    return m;
  }, [emails]);

  const byBucket = useMemo(() => {
    const groups: Record<Bucket, PartialTriageResult[]> = {
      act_today: [],
      decide_this_week: [],
      fyi: [],
    };
    for (const r of Object.values(results)) {
      if (r.signal) groups[r.signal.bucket].push(r);
    }
    for (const k of Object.keys(groups) as Bucket[]) {
      groups[k].sort((a, b) => b.signal!.priority - a.signal!.priority);
    }
    return groups;
  }, [results]);

  const pending = useMemo(
    () => Object.values(results).filter((r) => !r.signal && !r.done && !r.error),
    [results],
  );

  async function runTriage() {
    setError(null);
    setResults({});
    setRunning(true);
    setTotal(null);
    try {
      await api.triageStream(undefined, {
        onStart: (t) => setTotal(t),
        onStage: ({ email_id, stage, patch }) =>
          setResults((prev) => ({
            ...prev,
            [email_id]: {
              ...(prev[email_id] ?? { email_id }),
              ...patch,
              stage,
            },
          })),
        onEmailDone: (emailId) =>
          setResults((prev) => ({
            ...prev,
            [emailId]: {
              ...(prev[emailId] ?? { email_id: emailId }),
              done: true,
            },
          })),
        onError: (emailId, message) =>
          setResults((prev) => ({
            ...prev,
            [emailId]: {
              ...(prev[emailId] ?? { email_id: emailId }),
              error: message,
              done: true,
            },
          })),
      });
    } catch (e) {
      setError(String(e));
    } finally {
      setRunning(false);
    }
  }

  const done = Object.values(results).filter((r) => r.done).length;
  const sourceLabel = authed
    ? `Gmail · ${session?.user?.email ?? "connected"}`
    : "Demo · seeded sales inbox";

  return (
    <main className="max-w-7xl mx-auto px-6 pt-12 pb-20">
      <header className="relative mb-10">
        <div
          aria-hidden
          className="absolute -top-10 -left-10 -right-10 h-[260px] bg-atmosphere blur-2xl opacity-90 pointer-events-none"
        />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] uppercase tracking-eyebrow text-accent">
              Email triage agent
            </p>
            <h1 className="font-serif text-display mt-2 text-ink">
              Your inbox,
              <br className="hidden sm:block" />{" "}
              <em className="text-accent">with a point of view.</em>
            </h1>
            <p className="text-base text-muted mt-4 max-w-xl leading-relaxed">
              Doesn’t just summarize — it prioritizes. The agent reads your
              context, then streams every message into one of three buckets so
              you only see what matters now.
            </p>
            <div className="hairline mt-6 max-w-sm" />
          </div>

          <div className="flex flex-col items-start md:items-end gap-3">
            <span className="text-[11px] uppercase tracking-eyebrow text-muted">
              Source · {sourceLabel}
            </span>
            <button
              onClick={runTriage}
              disabled={running || emails.length === 0}
              className="group inline-flex items-center gap-2 px-5 py-3 rounded-full bg-accent text-white text-sm font-medium hover:bg-accent/90 transition disabled:opacity-50 shadow-edge"
            >
              {running
                ? total
                  ? `Triaging · ${done}/${total}`
                  : "Starting…"
                : "Run triage"}
              <span
                aria-hidden
                className="transition group-hover:translate-x-0.5"
              >
                →
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="mb-6">
        <SignInGate />
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <aside className="flex flex-col gap-4">
          <ContextCard />
          <section className="surface card-edge p-5">
            <div className="flex items-baseline justify-between">
              <p className="text-[11px] uppercase tracking-eyebrow text-accent">
                Inbox
              </p>
              <span className="text-xs text-muted tabular-nums">
                {emailsLoading ? "…" : emails.length}
              </span>
            </div>
            <h3 className="font-serif text-xl mt-1 leading-tight">
              {authed ? "Your latest messages" : "Seeded sales inbox"}
            </h3>
            <p className="text-xs text-muted mt-1">
              {authed
                ? "Pulled from Gmail (read-only). The agent sees what you see."
                : "Connect Gmail above to run triage against your real inbox."}
            </p>
            <ul className="mt-4 divide-y divide-line/80 text-sm">
              {emails.slice(0, 10).map((e) => (
                <li key={e.id} className="py-2.5">
                  <p className="truncate font-medium text-ink">{e.subject}</p>
                  <p className="text-xs text-muted truncate mt-0.5">
                    <span className="text-ink-soft">{e.sender_name}</span>{" "}
                    · {new Date(e.received_at).toLocaleDateString()}
                  </p>
                </li>
              ))}
              {emails.length === 0 && !emailsLoading && (
                <li className="py-6 text-center text-muted italic text-sm">
                  Inbox is empty.
                </li>
              )}
            </ul>
            {emails.length > 10 && (
              <p className="mt-3 text-[11px] text-muted">
                +{emails.length - 10} more — triage runs on all of them.
              </p>
            )}
          </section>
        </aside>

        <section className="flex flex-col gap-5">
          {error && (
            <div className="surface border-red-200 p-3 text-sm text-red-800 bg-red-50">
              {error}
            </div>
          )}

          {!running && done === 0 && !error && (
            <div className="surface-quiet border border-dashed border-line p-10 text-center rounded-2xl">
              <p className="font-serif text-2xl mb-1">Ready when you are.</p>
              <p className="text-sm text-muted max-w-md mx-auto">
                Set your context on the left, then click{" "}
                <em className="text-ink-soft">Run triage</em>. Results stream
                in as the agent finishes each email.
              </p>
            </div>
          )}

          {pending.length > 0 && (
            <div className="surface card-edge p-4">
              <p className="text-[11px] uppercase tracking-eyebrow text-accent mb-2">
                Classifying {pending.length}
              </p>
              <ul className="text-sm space-y-1.5">
                {pending.map((p) => (
                  <li
                    key={p.email_id}
                    className="flex items-center gap-2 text-ink-soft"
                  >
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" />
                    <span className="truncate">
                      {emailsById[p.email_id]?.subject ?? p.email_id}
                    </span>
                    <span className="text-xs text-muted ml-auto">
                      {stageLabel(p.stage)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <BucketColumn
            title="Act today"
            subtitle="Time-critical. Reply or decide now."
            eyebrow="bucket 01 · now"
            accent="act"
            results={byBucket.act_today}
            emails={emailsById}
            empty="Nothing burning right now."
          />
          <BucketColumn
            title="Decide this week"
            subtitle="Important, not urgent. Block time."
            eyebrow="bucket 02 · this week"
            accent="decide"
            results={byBucket.decide_this_week}
            emails={emailsById}
            empty="No pending decisions."
          />
          <BucketColumn
            title="FYI"
            subtitle="Archived by default. Skim only if you want."
            eyebrow="bucket 03 · fyi"
            accent="fyi"
            results={byBucket.fyi}
            emails={emailsById}
            empty="Nothing to skim."
          />
        </section>
      </div>
    </main>
  );
}

function stageLabel(stage: Stage | undefined): string {
  if (!stage) return "queued";
  const idx = STAGE_ORDER.indexOf(stage);
  return idx >= 0 ? `${stage} (${idx + 1}/${STAGE_ORDER.length})` : stage;
}
