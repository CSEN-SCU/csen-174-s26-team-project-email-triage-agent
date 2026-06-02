"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const BASELINE_CONTEXT =
  "I am a solo technical founder building a B2B workflow product. This week, prioritize customer issues, active pilots, investor follow-ups, revenue pipeline, legal/procurement blockers, and anything that could affect trust or momentum. Put same-day replies, outages, investor asks, and blocked deals in Act today. Put strategic decisions, contract review, product feedback, and partner follow-ups in Decide this week. Deprioritize receipts, newsletters, routine vendor updates, automated notifications, and low-context cold outreach.";

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

  function autofillBaseline() {
    setValue(BASELINE_CONTEXT);
    setSavedAt(null);
  }

  return (
    <section className="surface card-edge p-6">
      <p className="eyebrow text-steel">Context</p>
      <h2 className="text-heading-3 mt-1 leading-tight text-ink">
        What are you working on right now?
      </h2>
      <p className="text-sm text-slate mt-1">
        Every priority decision is grounded in this. One paragraph is enough.
      </p>

      <textarea
        className="w-full min-h-[120px] mt-4 border border-hairline-strong rounded-notion p-3.5 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-ink/20 bg-canvas placeholder:text-muted"
        placeholder="e.g. AE selling a Series B observability platform. ICP: 200-2k eng orgs. Top Q4 deals: Acme (POC), Globex (procurement), Initech (renewal + expansion)."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={!loaded}
      />
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] text-steel">
          {savedAt
            ? `saved · ${new Date(savedAt).toLocaleTimeString()}`
            : loaded
              ? "unsaved changes"
              : "loading…"}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={autofillBaseline}
            disabled={!loaded || saving}
            className="btn-secondary text-xs !h-9 !px-4 disabled:opacity-50"
          >
            Autofill
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving || !loaded}
            className="btn-primary text-xs !h-9 !px-4 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save context"}
          </button>
        </div>
      </div>
    </section>
  );
}
