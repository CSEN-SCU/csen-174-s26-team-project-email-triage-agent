import Link from "next/link";

const footerLinks = [
  { href: "/privacy", label: "Privacy policy" },
  { href: "/terms", label: "Usage terms" },
] as const;

export function MarketingFooter() {
  return (
    <footer className="border-t border-hairline bg-canvas">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 text-sm text-slate md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold text-ink">Email Triage</p>
          <p className="mt-1 max-w-md leading-relaxed">
            Context-aware inbox triage for founders, with user-approved Gmail
            drafts and replies from the app.
          </p>
        </div>

        <div className="flex flex-col gap-4 md:items-end">
          <nav aria-label="Legal" className="flex flex-wrap gap-2">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="btn-secondary !h-9">
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="text-xs text-steel">
            © {new Date().getFullYear()} Email Triage. Built for focused work.
          </p>
        </div>
      </div>
    </footer>
  );
}
