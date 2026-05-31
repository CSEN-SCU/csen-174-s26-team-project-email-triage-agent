"use client";

export function LandingCtas({
  busy,
  onConnect,
  className = "",
}: {
  busy: boolean;
  onConnect: () => void;
  variant?: "light" | "dark" | "navy";
  className?: string;
}) {
  return (
    <div className={`flex flex-col sm:flex-row gap-3 sm:items-center ${className}`}>
      <button
        type="button"
        disabled={busy}
        aria-busy={busy}
        onClick={onConnect}
        className="btn-primary disabled:opacity-60"
      >
        {busy ? "Connecting…" : "Connect Gmail"}
        {!busy && <span aria-hidden>→</span>}
      </button>
    </div>
  );
}
