"use client";

import Link from "next/link";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2";

export function LandingCtas({
  busy,
  onConnect,
  variant = "light",
  className = "",
}: {
  busy: boolean;
  onConnect: () => void;
  variant?: "light" | "dark";
  className?: string;
}) {
  const offset =
    variant === "dark"
      ? "focus-visible:ring-offset-ink"
      : "focus-visible:ring-offset-paper";

  return (
    <div className={`flex flex-col sm:flex-row gap-3 sm:items-center ${className}`}>
      <button
        type="button"
        disabled={busy}
        aria-busy={busy}
        onClick={onConnect}
        className={`inline-flex justify-center items-center gap-2 h-12 px-6 rounded-full bg-accent text-white text-sm font-medium hover:bg-accent/90 active:scale-[0.98] transition-[color,transform] duration-150 disabled:opacity-60 disabled:pointer-events-none ${focusRing} ${offset} ${
          variant === "light" ? "shadow-edge" : ""
        }`}
      >
        {busy ? "Connecting…" : "Connect Gmail"}
        {!busy && <span aria-hidden>→</span>}
      </button>
      <Link
        href="/app"
        className={`inline-flex justify-center items-center gap-2 h-12 px-6 rounded-full text-sm font-medium active:scale-[0.98] transition-[color,transform,background-color,border-color] duration-150 ${focusRing} ${offset} ${
          variant === "dark"
            ? "border border-paper/25 text-paper hover:bg-paper/10"
            : "border border-line bg-white/60 text-ink hover:border-line-strong hover:bg-surface"
        }`}
      >
        Try demo
      </Link>
    </div>
  );
}
