"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export function ContextCard({ onSaved }: { onSaved?: (ctx: string) => void }) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api
      .getContext()
      .then((ctx) => {
        setValue(ctx);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const next = await api.setContext(value);
      onSaved?.(next);
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="surface card-edge p-6">
      <p className="text-[11px] uppercase tracking-eyebrow text-accent">
        Context
      </p>
      <h2 className="font-serif text-2xl mt-1 leading-tight">
        What are you working on right now?
      </h2>
      <p className="text-sm text-muted mt-1">
        Every priority decision is grounded in this. One paragraph is enough.
      </p>

      <textarea
        className="w-full min-h-[120px] mt-4 border border-line rounded-xl p-3.5 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent/40 bg-paper-deep/40 placeholder:text-muted/70"
        placeholder="e.g. AE selling a Series B observability platform. ICP: 200-2k eng orgs. Top Q4 deals: Acme (POC), Globex (procurement), Initech (renewal + expansion)."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={!loaded}
      />
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] text-muted">
          {savedAt
            ? `saved · ${new Date(savedAt).toLocaleTimeString()}`
            : loaded
              ? "unsaved changes"
              : "loading…"}
        </span>
        <button
          onClick={save}
          disabled={saving || !loaded}
          className="px-4 py-2 rounded-full bg-ink text-paper text-xs font-medium hover:bg-ink-soft transition disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save context"}
        </button>
      </div>
    </section>
  );
}
