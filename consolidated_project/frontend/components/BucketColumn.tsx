"use client";

import { useEffect, useId, useState } from "react";
import type { Email, PartialTriageResult } from "@/lib/types";
import { TriageCard } from "./TriageCard";

const PAGE_SIZE = 3;

function moreItemsLabel(count: number): string {
  return count === 1 ? "1 item more" : `${count} more items`;
}

function Chevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      aria-hidden
      className={`shrink-0 w-4 h-4 text-muted transition-transform duration-150 motion-reduce:transition-none ${
        expanded ? "rotate-180" : ""
      }`}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type Accent = "act" | "decide" | "fyi";

const ACCENT_STYLES: Record<
  Accent,
  { tone: string; dot: string; eyebrow: string }
> = {
  act: { tone: "text-accent", dot: "bg-accent", eyebrow: "text-accent" },
  decide: { tone: "text-decide", dot: "bg-decide", eyebrow: "text-decide" },
  fyi: { tone: "text-fyi", dot: "bg-fyi", eyebrow: "text-fyi" },
};

export function BucketColumn({
  title,
  subtitle,
  accent,
  results,
  emails,
  empty,
  eyebrow,
  defaultExpanded = true,
}: {
  title: string;
  subtitle: string;
  accent: Accent;
  results: PartialTriageResult[];
  emails: Record<string, Email>;
  empty: string;
  eyebrow: string;
  /** FYI defaults collapsed; Act / Decide stay open. */
  defaultExpanded?: boolean;
}) {
  const styles = ACCENT_STYLES[accent];
  const headingId = useId();
  const panelId = useId();
  const listId = useId();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const total = results.length;

  useEffect(() => {
    if (total === 0) {
      setVisibleCount(PAGE_SIZE);
      return;
    }
    setVisibleCount((n) => Math.min(n, total));
  }, [total]);

  const shown = results.slice(0, visibleCount);
  const remaining = total - shown.length;
  const countLabel = String(total);

  return (
    <section className={`bucket card-edge ${styles.tone}`}>
      <header className="px-5 pt-5 pb-3">
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={() => setExpanded((open) => !open)}
          className="w-full text-left rounded-lg -mx-1 px-1 py-0.5 hover:bg-paper-deep/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper transition-colors duration-150"
        >
          <div className="flex items-center gap-2 min-h-[1.125rem]">
            <span
              className={`shrink-0 inline-block w-2 h-2 rounded-full ${styles.dot}`}
              aria-hidden
            />
            <p
              className={`text-[11px] uppercase tracking-eyebrow ${styles.eyebrow}`}
            >
              {eyebrow}
            </p>
            <span
              className="ml-auto text-xs text-muted tabular-nums"
              aria-label={`${total} ${total === 1 ? "item" : "items"} in ${title}`}
            >
              {countLabel}
            </span>
            <Chevron expanded={expanded} />
          </div>
          <h2
            id={headingId}
            className="font-serif text-2xl mt-1.5 text-ink leading-tight pr-6"
          >
            {title}
          </h2>
          <p className="text-sm text-muted mt-1 max-w-prose leading-relaxed pr-6">
            {subtitle}
          </p>
        </button>
      </header>

      <div
        id={panelId}
        role="region"
        aria-labelledby={headingId}
        hidden={!expanded}
        className="px-5 pb-5"
      >
        {total === 0 ? (
          <p className="border border-dashed border-line rounded-xl py-9 px-4 text-center text-sm text-muted leading-relaxed">
            {empty}
          </p>
        ) : (
          <>
            <div
              id={listId}
              className="flex flex-col gap-3 stagger"
              role="list"
              aria-label={`${title} messages`}
            >
              {shown.map((r) => (
                <div key={r.email_id} role="listitem">
                  <TriageCard
                    result={r}
                    email={emails[r.email_id]}
                    accent={accent}
                  />
                </div>
              ))}
            </div>
            {remaining > 0 && (
              <button
                type="button"
                aria-controls={listId}
                aria-label={`Show ${remaining} more in ${title}`}
                onClick={() =>
                  setVisibleCount((n) => Math.min(n + PAGE_SIZE, total))
                }
                className="mt-3 w-full rounded-xl border border-line bg-white/60 px-4 py-3 text-sm font-medium text-muted hover:text-ink hover:border-line-strong hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper active:bg-surface transition-colors duration-150"
              >
                {moreItemsLabel(remaining)}
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}
