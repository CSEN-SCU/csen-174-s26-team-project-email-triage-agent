"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

export function LandingNav() {
  const [busy, setBusy] = useState(false);

  async function connectGmail() {
    setBusy(true);
    await signIn("google", { callbackUrl: "/app" });
  }

  return (
    <nav
      aria-label="Site"
      className="border-b border-line/70 bg-paper/80 backdrop-blur-md sticky top-0 z-50"
    >
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
        <Link
          href="/"
          className={`flex items-center gap-2 shrink-0 rounded-md -ml-1 pl-1 pr-2 py-1 hover:opacity-90 transition-opacity ${focusRing}`}
        >
          <span
            aria-hidden
            className="w-7 h-7 rounded-md bg-ink text-paper grid place-items-center font-mono text-[11px] leading-none tracking-tighter"
          >
            []
          </span>
          <span className="font-serif text-lg leading-none tracking-tight text-ink">
            Email Triage
          </span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/app"
            className={`hidden sm:inline-flex items-center h-9 px-4 rounded-full border border-line bg-white/60 text-sm font-medium text-ink hover:border-line-strong hover:bg-surface active:scale-[0.98] transition-[color,transform,background-color,border-color] duration-150 ${focusRing}`}
          >
            Try demo
          </Link>
          <button
            type="button"
            disabled={busy}
            aria-busy={busy}
            onClick={connectGmail}
            className={`inline-flex items-center h-9 px-4 rounded-full bg-accent text-white text-sm font-medium hover:bg-accent/90 active:scale-[0.98] transition-[color,transform] duration-150 disabled:opacity-60 disabled:pointer-events-none shadow-edge ${focusRing}`}
          >
            {busy ? "Connecting…" : "Connect Gmail"}
          </button>
        </div>
      </div>
    </nav>
  );
}
