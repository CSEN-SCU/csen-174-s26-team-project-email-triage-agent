import { AuthChip } from "./AuthChip";
import { LogoMark } from "./LogoMark";

export function Nav() {
  return (
    <nav className="border-b border-line/70 bg-paper/70 backdrop-blur-md sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <a href="/app" className="flex items-center gap-2 group">
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
