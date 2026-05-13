"use client";

import { signIn, useSession } from "next-auth/react";

export function SignInGate() {
  const { data: session, status } = useSession();
  if (status === "loading" || session?.user) return null;

  return (
    <section className="relative surface card-edge overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-atmosphere opacity-80 pointer-events-none"
      />
      <div className="relative p-6 md:p-7 flex flex-col md:flex-row md:items-center gap-5">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] uppercase tracking-eyebrow text-accent">
            Demo mode · seeded inbox
          </p>
          <h2 className="font-serif text-2xl mt-1 leading-snug">
            Triage <em className="text-accent">your</em> inbox, not a fixture.
          </h2>
          <p className="text-sm text-muted mt-1 max-w-xl">
            Connect Gmail (read-only) and the agent will pull your latest
            messages, score them against the context on the left, and stream
            results into the three buckets below.
          </p>
        </div>
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="self-start md:self-auto inline-flex items-center gap-2 h-10 px-4 rounded-full bg-ink text-paper text-sm font-medium hover:bg-ink-soft transition whitespace-nowrap"
        >
          Connect Gmail
          <span aria-hidden>→</span>
        </button>
      </div>
    </section>
  );
}
