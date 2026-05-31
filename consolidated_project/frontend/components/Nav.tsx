import { AuthChip } from "./AuthChip";
import { LogoMark } from "./LogoMark";

export function Nav() {
  return (
    <nav className="sticky top-3 z-20 px-4">
      <div className="mx-auto flex h-[3.25rem] max-w-7xl items-center justify-between rounded-full border border-hairline bg-canvas/95 px-5 shadow-subtle backdrop-blur-sm sm:px-6">
        <a href="/app" className="flex items-center gap-2 group rounded-full px-1.5 py-1">
          <LogoMark className="w-7 h-7" bare />
          <span className="text-base font-semibold leading-none tracking-tight text-ink">
            Email Triage
          </span>
        </a>
        <AuthChip />
      </div>
    </nav>
  );
}
