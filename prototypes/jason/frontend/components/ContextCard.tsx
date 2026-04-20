"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export function ContextCard({ onSaved }: { onSaved?: (ctx: string) => void }) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api.getContext().then((ctx) => {
      setValue(ctx);
      setLoaded(true);
    });
  }, []);

  async function save() {
    setSaving(true);
    try {
      const next = await api.setContext(value);
      onSaved?.(next);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="bg-white border border-line rounded-2xl p-6 card-edge">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="font-serif text-xl">What are you working on right now?</h2>
        <span className="text-xs text-muted">The agent grounds every decision in this.</span>
      </div>
      <textarea
        className="w-full min-h-[110px] border border-line rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 bg-paper/50"
        placeholder="e.g. Raising a seed extension, piloting with Acme and PilotCo, hiring a founding engineer."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={!loaded}
      />
      <div className="mt-3 flex justify-end">
        <button
          onClick={save}
          disabled={saving || !loaded}
          className="px-4 py-2 rounded-lg bg-ink text-paper text-sm hover:bg-accent transition disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save context"}
        </button>
      </div>
    </section>
  );
}
