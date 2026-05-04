import type {
  Email,
  StageEvent,
  TriageDigest,
  TriageResult,
} from "./types";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  async listEmails(): Promise<Email[]> {
    return json(await fetch("/api/emails", { cache: "no-store" }));
  },

  async getContext(): Promise<string> {
    const data = await json<{ user_context: string }>(
      await fetch("/api/context", { cache: "no-store" })
    );
    return data.user_context;
  },

  async setContext(userContext: string): Promise<string> {
    const data = await json<{ user_context: string }>(
      await fetch("/api/context", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ user_context: userContext }),
      })
    );
    return data.user_context;
  },

  async triage(userContext?: string): Promise<TriageDigest> {
    return json(
      await fetch("/api/triage", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ user_context: userContext }),
      })
    );
  },

  /**
   * Streams triage progress via SSE. Fires `onStage` after every LangGraph node
   * completes (per email), `onEmailDone` when all stages for an email finish.
   * Resolves when the server sends `event: done`.
   */
  async triageStream(
    userContext: string | undefined,
    handlers: {
      onStart?: (total: number) => void;
      onStage?: (e: StageEvent) => void;
      onEmailDone?: (emailId: string) => void;
      onError?: (emailId: string, message: string) => void;
      // Legacy per-email callback: fired alongside onEmailDone for compatibility.
      onResult?: (r: TriageResult) => void;
    }
  ): Promise<void> {
    const res = await fetch("/api/triage/stream", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ user_context: userContext }),
    });
    if (!res.ok || !res.body) {
      throw new Error(`stream failed: ${res.status}`);
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const events = buf.split("\n\n");
      buf = events.pop() ?? "";
      for (const raw of events) {
        const lines = raw.split("\n");
        const eventLine = lines.find((l) => l.startsWith("event:"));
        const dataLine = lines.find((l) => l.startsWith("data:"));
        if (!eventLine || !dataLine) continue;
        const event = eventLine.slice(6).trim();
        const data = dataLine.slice(5).trim();
        if (event === "start") handlers.onStart?.(JSON.parse(data).total);
        else if (event === "stage") handlers.onStage?.(JSON.parse(data));
        else if (event === "email_done") {
          const parsed = JSON.parse(data) as { email_id: string };
          handlers.onEmailDone?.(parsed.email_id);
        } else if (event === "error") {
          const parsed = JSON.parse(data) as {
            email_id: string;
            message: string;
          };
          handlers.onError?.(parsed.email_id, parsed.message);
        } else if (event === "done") return;
      }
    }
  },
};
