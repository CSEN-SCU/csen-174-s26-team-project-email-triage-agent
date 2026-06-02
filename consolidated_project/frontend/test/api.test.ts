import { api } from "@/lib/api"
import { Email, TriageResult } from "@/lib/types";
import { test, expect } from "vitest";
import { server } from "@/test/setup";
import { http, HttpResponse } from "msw";

/** Build a minimal SSE body string from an array of {event, data} pairs. */
function sseBody(events: Array<{ event: string; data: unknown }>): string {
  return events
    .map((e) => `event: ${e.event}\ndata: ${JSON.stringify(e.data)}\n\n`)
    .join("");
}

const MOCK_RESULT: TriageResult = {
  email_id: "e1",
  signal: { intent: "deal", priority: 90, bucket: "act_today", reason: "Urgent" },
  summary: "An investor needs Q3 numbers.",
  actions: [{ kind: "reply", label: "Send Q3 metrics", due_hint: "today" }],
  draft_reply: null,
};

test("getContext returns some context that isn't empty", async () => {
    const ctx = await api.getContext();
    expect(typeof ctx).toBe("string");
    expect(ctx.length).toBeGreaterThan(0);
});

test("listEmails returns all emails needed", async () => {
    const emails = await api.listEmails();
    expect(Array.isArray(emails)).toBe(true);
    expect(emails[0]).toEqual(expect.objectContaining({
        id: expect.any(String),
        subject: expect.any(String),
        thread_id: expect.any(String),

    }));
});

test("sendReply posts the draft and returns the send result", async () => {
    server.use(
        http.post("/api/send", async ({ request }) => {
            const body = (await request.json()) as { email_id: string; body: string };
            expect(body).toEqual({ email_id: "e1", body: "Sounds good." });
            return HttpResponse.json({ id: "sent123", thread_id: "t1", status: "sent" });
        })
    );
    const result = await api.sendReply("e1", "Sounds good.");
    expect(result).toEqual({ id: "sent123", thread_id: "t1", status: "sent" });
});

test("saveDraft posts the draft and returns the draft result", async () => {
    server.use(
        http.post("/api/draft", async ({ request }) => {
            const body = (await request.json()) as { email_id: string; body: string };
            expect(body).toEqual({ email_id: "e2", body: "Draft this." });
            return HttpResponse.json({ draft_id: "draft456", status: "draft_saved" });
        })
    );
    const result = await api.saveDraft("e2", "Draft this.");
    expect(result).toEqual({ draft_id: "draft456", status: "draft_saved" });
});

test("sendReply throws on a non-ok response", async () => {
    server.use(
        http.post("/api/send", () =>
            HttpResponse.json({ detail: "gmail authentication required" }, { status: 401 })
        )
    );
    await expect(api.sendReply("e1", "hi")).rejects.toThrow();
});

test("triageStream fires onStart and onResult for start+result+done events", async () => {
    const body = sseBody([
        { event: "start", data: { total: 1 } },
        { event: "result", data: { email_id: "e1", result: MOCK_RESULT } },
        { event: "done", data: {} },
    ]);
    server.use(
        http.post("/api/triage/stream", () =>
            new HttpResponse(body, {
                headers: { "content-type": "text/event-stream" },
            })
        )
    );

    const startValues: number[] = [];
    const resultValues: Array<{ emailId: string; result: TriageResult }> = [];

    await api.triageStream(undefined, {
        onStart: (total) => startValues.push(total),
        onResult: (emailId, result) => resultValues.push({ emailId, result }),
    });

    expect(startValues).toEqual([1]);
    expect(resultValues).toHaveLength(1);
    expect(resultValues[0].emailId).toBe("e1");
    expect(resultValues[0].result).toEqual(MOCK_RESULT);
});

test("triageStream fires onError when an error event arrives", async () => {
    const body = sseBody([
        { event: "start", data: { total: 1 } },
        { event: "error", data: { email_id: "e1", message: "triage failed" } },
        { event: "done", data: {} },
    ]);
    server.use(
        http.post("/api/triage/stream", () =>
            new HttpResponse(body, {
                headers: { "content-type": "text/event-stream" },
            })
        )
    );

    const errors: Array<{ emailId: string; message: string }> = [];

    await api.triageStream(undefined, {
        onError: (emailId, message) => errors.push({ emailId, message }),
    });

    expect(errors).toEqual([{ emailId: "e1", message: "triage failed" }]);
});

test("triageStream resolves immediately on done with no emails", async () => {
    const body = sseBody([
        { event: "start", data: { total: 0 } },
        { event: "done", data: {} },
    ]);
    server.use(
        http.post("/api/triage/stream", () =>
            new HttpResponse(body, {
                headers: { "content-type": "text/event-stream" },
            })
        )
    );

    const resultValues: TriageResult[] = [];
    await api.triageStream(undefined, {
        onResult: (_id, result) => resultValues.push(result),
    });

    expect(resultValues).toHaveLength(0);
});