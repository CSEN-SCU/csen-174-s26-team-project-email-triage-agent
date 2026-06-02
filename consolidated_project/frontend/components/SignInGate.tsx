"use client";

import { signIn, useSession } from "next-auth/react";

export function SignInGate() {
  const { data: session, status } = useSession();
  if (status === "loading" || session?.user) return null;

  return (
    <section className="border border-hairline rounded-card p-6 md:p-7 flex flex-col md:flex-row md:items-center gap-5 bg-surface-soft">
      <div className="flex-1 min-w-0">
        <p className="eyebrow text-steel">Preview mode · sample inbox</p>
        <h2 className="text-heading-4 mt-2 leading-snug text-ink">
          Triage your inbox, not a fixture.
        </h2>
        <p className="text-sm text-slate mt-2 max-w-xl leading-relaxed">
          Connect Gmail and the agent will pull your latest messages, score them
          against the context on the left, and let you save drafts or send replies
          when you choose.
        </p>
      </div>
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/app" })}
        className="btn-primary self-start md:self-auto whitespace-nowrap"
      >
        Connect Gmail
        <span aria-hidden>→</span>
      </button>
    </section>
  );
}
