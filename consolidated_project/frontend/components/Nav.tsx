import { AuthChip } from "./AuthChip";
import { LogoMark } from "./LogoMark";

export function Nav() {
  return (
    <nav className="sticky top-0 z-20 border-b border-hairline bg-canvas/95 backdrop-blur-sm">
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-6">
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
