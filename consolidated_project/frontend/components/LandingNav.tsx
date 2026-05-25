"use client";

import Link from "next/link";
import { AuthChip } from "./AuthChip";
import { LogoMark } from "./LogoMark";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

export function LandingNav() {
  return (
    <nav aria-label="Site" className="sticky top-3 z-50 px-3 sm:px-4">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 rounded-full border border-line/80 bg-paper/84 px-5 sm:px-6 shadow-edge backdrop-blur-md">
        <Link
          href="/"
          className={`flex items-center gap-2 shrink-0 rounded-full px-1.5 py-1 hover:opacity-90 transition-opacity ${focusRing}`}
        >
          <LogoMark className="w-7 h-7" bare />
          <span className="font-serif text-lg leading-none tracking-tight text-ink">
            Email Triage
          </span>
        </Link>
        <AuthChip />
      </div>
    </nav>
  );
}
