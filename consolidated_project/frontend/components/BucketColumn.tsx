"use client";

import type { Email, PartialTriageResult } from "@/lib/types";
import { TriageCard } from "./TriageCard";

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
}: {
  title: string;
  subtitle: string;
  accent: Accent;
  results: PartialTriageResult[];
  emails: Record<string, Email>;
  empty: string;
  eyebrow: string;
}) {
  const styles = ACCENT_STYLES[accent];

  return (
    <section className={`bucket card-edge ${styles.tone}`}>
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block w-2 h-2 rounded-full ${styles.dot}`}
            aria-hidden
          />
          <p
            className={`text-[11px] uppercase tracking-eyebrow ${styles.eyebrow}`}
          >
            {eyebrow}
          </p>
          <span className="ml-auto text-xs text-muted tabular-nums">
            {results.length}
          </span>
        </div>
        <h2 className="font-serif text-2xl mt-1 text-ink leading-tight">
          {title}
        </h2>
        <p className="text-sm text-muted mt-1">{subtitle}</p>
      </div>

      <div className="px-5 pb-5">
        {results.length === 0 ? (
          <div className="border border-dashed border-line rounded-xl py-8 text-center text-sm text-muted italic">
            {empty}
          </div>
        ) : (
          <div className="flex flex-col gap-3 stagger">
            {results.map((r) => (
              <TriageCard
                key={r.email_id}
                result={r}
                email={emails[r.email_id]}
                accent={accent}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
