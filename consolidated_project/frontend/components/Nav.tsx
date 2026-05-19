import { AuthChip } from "./AuthChip";

export function Nav() {
  return (
    <nav className="border-b border-line/70 bg-paper/70 backdrop-blur-md sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <a href="/app" className="flex items-center gap-2 group">
          <span
            aria-hidden
            className="w-7 h-7 rounded-md bg-ink text-paper grid place-items-center font-mono text-[11px] leading-none tracking-tighter"
          >
            []
          </span>
          <span className="font-serif text-lg leading-none tracking-tight">
            Email Triage
          </span>
        </a>
        <AuthChip />
      </div>
    </nav>
  );
}
