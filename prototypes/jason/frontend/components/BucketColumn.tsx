"use client";

import type { Email, TriageResult } from "@/lib/types";
import { TriageCard } from "./TriageCard";

export function BucketColumn({
  title,
  subtitle,
  accent,
  results,
  emails,
  empty,
}: {
  title: string;
  subtitle: string;
  accent: "act" | "decide" | "fyi";
  results: TriageResult[];
  emails: Record<string, Email>;
  empty: string;
}) {
  const ring =
    accent === "act"
      ? "border-accent/50"
      : accent === "decide"
      ? "border-yellow-500/40"
      : "border-line";
  const dot =
    accent === "act" ? "bg-accent" : accent === "decide" ? "bg-yellow-500" : "bg-muted/60";

  return (
    <div className={`flex flex-col gap-3 p-4 rounded-2xl border-2 border-dashed ${ring} bg-white/40`}>
      <div>
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${dot}`} />
          <h2 className="font-serif text-xl">{title}</h2>
          <span className="text-sm text-muted ml-auto">{results.length}</span>
        </div>
        <p className="text-xs text-muted mt-1">{subtitle}</p>
      </div>

      {results.length === 0 ? (
        <div className="text-sm text-muted italic py-8 text-center">{empty}</div>
      ) : (
        <div className="flex flex-col gap-3">
          {results.map((r) => (
            <TriageCard key={r.email_id} result={r} email={emails[r.email_id]} />
          ))}
        </div>
      )}
    </div>
  );
}
