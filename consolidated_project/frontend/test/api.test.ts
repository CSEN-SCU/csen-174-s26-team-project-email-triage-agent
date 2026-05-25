import { api } from "@/lib/api"
import { Email } from "@/lib/types";
import { test, expect } from "vitest";
import { server } from "@/test/setup";
import { http, HttpResponse } from "msw";

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