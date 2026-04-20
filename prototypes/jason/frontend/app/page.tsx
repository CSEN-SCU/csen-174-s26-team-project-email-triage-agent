"use client";

import { useEffect, useMemo, useState } from "react";
import { BucketColumn } from "@/components/BucketColumn";
import { ContextCard } from "@/components/ContextCard";
import { api } from "@/lib/api";
import type { Bucket, Email, TriageResult } from "@/lib/types";

export default function Home() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [results, setResults] = useState<Record<string, TriageResult>>({});
  const [running, setRunning] = useState(false);
  const [total, setTotal] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.listEmails().then(setEmails).catch((e) => setError(String(e)));
  }, []);

  const emailsById = useMemo(() => {
    const m: Record<string, Email> = {};
    for (const e of emails) m[e.id] = e;
    return m;
  }, [emails]);

  const byBucket = useMemo(() => {
    const groups: Record<Bucket, TriageResult[]> = {
      act_today: [],
      decide_this_week: [],
      fyi: [],
    };
    for (const r of Object.values(results)) groups[r.signal.bucket].push(r);
    for (const k of Object.keys(groups) as Bucket[]) {
      groups[k].sort((a, b) => b.signal.priority - a.signal.priority);
    }
    return groups;
  }, [results]);

  async function runTriage() {
    setError(null);
    setResults({});
    setRunning(true);
    setTotal(null);
    try {
      await api.triageStream(
        undefined,
        (r) => setResults((prev) => ({ ...prev, [r.email_id]: r })),
        (t) => setTotal(t)
      );
    } catch (e) {
      setError(String(e));
    } finally {
      setRunning(false);
    }
  }

  const done = Object.keys(results).length;

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      <header className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Email Triage Agent</p>
          <h1 className="font-serif text-4xl mt-1">
            Your inbox, <span className="text-accent">with a point of view.</span>
          </h1>
          <p className="text-sm text-muted mt-2 max-w-xl">
            Built for founders. Understands your fundraise, your customers, your deadlines.
            Doesn&apos;t just summarize — it prioritizes.
          </p>
        </div>
        <button
          onClick={runTriage}
          disabled={running || emails.length === 0}
          className="px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 transition disabled:opacity-50"
        >
          {running
            ? total
              ? `Triaging… ${done}/${total}`
              : "Starting…"
            : "Run triage"}
        </button>
      </header>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <aside className="flex flex-col gap-4">
          <ContextCard />
          <section className="bg-white border border-line rounded-2xl p-5 card-edge">
            <h3 className="font-serif text-lg mb-2">Inbox</h3>
            <p className="text-xs text-muted mb-3">
              {emails.length} messages loaded from the seeded founder inbox.
            </p>
            <ul className="divide-y divide-line text-sm">
              {emails.map((e) => (
                <li key={e.id} className="py-2">
                  <p className="truncate font-medium">{e.subject}</p>
                  <p className="text-xs text-muted truncate">
                    {e.sender_name} ·{" "}
                    {new Date(e.received_at).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </aside>

        <section className="flex flex-col gap-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}
          {!running && done === 0 && !error && (
            <div className="bg-white border border-dashed border-line rounded-2xl p-10 text-center">
              <p className="font-serif text-xl mb-1">Ready when you are.</p>
              <p className="text-sm text-muted">
                Set your context on the left, then click <em>Run triage</em>. Results stream in
                as the agent finishes each email.
              </p>
            </div>
          )}

          <BucketColumn
            title="Act today"
            subtitle="Time-critical. Reply or decide now."
            accent="act"
            results={byBucket.act_today}
            emails={emailsById}
            empty="Nothing burning right now."
          />
          <BucketColumn
            title="Decide this week"
            subtitle="Important, not urgent. Block time."
            accent="decide"
            results={byBucket.decide_this_week}
            emails={emailsById}
            empty="No pending decisions."
          />
          <BucketColumn
            title="FYI"
            subtitle="Archived by default. Skim only if you want."
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
