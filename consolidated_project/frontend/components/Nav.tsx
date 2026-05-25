import { AuthChip } from "./AuthChip";
import { LogoMark } from "./LogoMark";

export function Nav() {
  return (
    <nav className="sticky top-3 z-20 px-3 sm:px-4">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between rounded-full border border-line/80 bg-paper/84 px-5 sm:px-6 shadow-edge backdrop-blur-md">
        <a href="/app" className="flex items-center gap-2 group rounded-full px-1.5 py-1">
          <LogoMark className="w-7 h-7" bare />
          <span className="font-serif text-lg leading-none tracking-tight">
            Email Triage
          </span>
        </a>
        <AuthChip />
      </div>
    </nav>
  );
}
