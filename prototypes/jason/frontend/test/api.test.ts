import { api } from "@/lib/api"
import { Email } from "@/lib/types";
import { test, expect } from "vitest";


test("getContext returns some context that isn't empty", async () => {
    const ctx = await api.getContext();
    expect(typeof ctx).toBe("string");
    expect(ctx.length).toBeGreaterThan(0);
});

test("list emails returns all emails needed", async () => {
    const emails = await api.listEmails();
    expect(Array.isArray(emails)).toBe(true);
    expect(emails[0]).toEqual(expect.objectContaining({
        id: expect.any(String),
        subject: expect.any(String),
        thread_id: expect.any(String),
        
    }));
});