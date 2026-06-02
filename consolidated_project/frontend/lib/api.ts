import type {
  DraftResult,
  Email,
  SendResult,
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

  async triage(userContext?: string, emailIds?: string[]): Promise<TriageDigest> {
    return json(
      await fetch("/api/triage", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ user_context: userContext, email_ids: emailIds }),
      })
    );
  },

  async sendReply(emailId: string, body: string): Promise<SendResult> {
    return json(
      await fetch("/api/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email_id: emailId, body }),
      })
    );
  },

  async saveDraft(emailId: string, body: string): Promise<DraftResult> {
    return json(
      await fetch("/api/draft", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email_id: emailId, body }),
      })
    );
  },

  /**
   * Streams triage results via SSE. Fires `onResult` once per email when the
   * agent finishes triaging it. Resolves when the server sends `event: done`.
   *
   * Events emitted by the server:
   *   start  → { total: number }
   *   result → { email_id: string, result: TriageResult }
   *   error  → { email_id: string, message: string }
   *   done   → {}
   */
  async triageStream(
    userContext: string | undefined,
    handlers: {
      onStart?: (total: number) => void;
      onResult?: (emailId: string, result: TriageResult) => void;
      onError?: (emailId: string, message: string) => void;
    },
    emailIds?: string[]
  ): Promise<void> {
    const res = await fetch("/api/triage/stream", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ user_context: userContext, email_ids: emailIds }),
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
        if (event === "start") {
          handlers.onStart?.(JSON.parse(data).total);
        } else if (event === "result") {
          const parsed = JSON.parse(data) as {
            email_id: string;
            result: TriageResult;
          };
          handlers.onResult?.(parsed.email_id, parsed.result);
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
