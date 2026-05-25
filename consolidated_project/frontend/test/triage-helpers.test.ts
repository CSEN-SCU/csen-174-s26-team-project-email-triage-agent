import { describe, expect, test } from "vitest"

import {
    canSubmitDraft,
    clampTriagePriority,
    countDigestEmails,
    isValidBucket,
} from "@/lib/triage-helpers"
import type { TriageResult } from "@/lib/types"

// Plain language: the UI must only treat real API bucket names as buckets so labels and styling stay in sync.
describe("isValidBucket", () => {
    test("only exact API bucket slugs count as valid triage columns", () => {
        expect(isValidBucket("act_today")).toBe(true)
        expect(isValidBucket("decide_this_week")).toBe(true)
        expect(isValidBucket("fyi")).toBe(true)
        expect(isValidBucket("spam")).toBe(false)
        expect(isValidBucket("")).toBe(false)
        expect(isValidBucket("FYI")).toBe(false)
        expect(isValidBucket(" act_today")).toBe(false)
    })
})

// Plain language: priority badges should never show values outside 0–100 even if data is weird.
describe("clampTriagePriority", () => {
    test("clamps to the closed interval 0 through 100", () => {
        expect(clampTriagePriority(-5)).toBe(0)
        expect(clampTriagePriority(0)).toBe(0)
        expect(clampTriagePriority(42)).toBe(42)
        expect(clampTriagePriority(100)).toBe(100)
        expect(clampTriagePriority(150)).toBe(100)
    })
})

// Plain language: “total triaged” in the header should match the sum of the three columns.
describe("countDigestEmails", () => {
    test("sums lengths of act_today, decide_this_week, and fyi", () => {
        const stub = (id: string): TriageResult => ({
            email_id: id,
            signal: {
                intent: "other",
                priority: 50,
                bucket: "fyi",
                reason: "",
            },
            summary: "",
            actions: [],
        })
        const digest = {
            act_today: [stub("a")],
            decide_this_week: [stub("b"), stub("c")],
            fyi: [],
        }
        expect(countDigestEmails(digest)).toBe(3)
    })
})

// Plain language: Send/Save buttons only work with a Gmail connection,
// non-empty text, and when no request is already in flight or finished.
describe("canSubmitDraft", () => {
    test("enabled with gmail, non-empty body, idle status", () => {
        expect(canSubmitDraft({ canSend: true, body: "hi", status: "idle" })).toBe(true)
        expect(canSubmitDraft({ canSend: true, body: "hi", status: "error" })).toBe(true)
    })

    test("disabled without a gmail connection", () => {
        expect(canSubmitDraft({ canSend: false, body: "hi", status: "idle" })).toBe(false)
    })

    test("disabled when body is empty or whitespace", () => {
        expect(canSubmitDraft({ canSend: true, body: "", status: "idle" })).toBe(false)
        expect(canSubmitDraft({ canSend: true, body: "   ", status: "idle" })).toBe(false)
    })

    test("disabled while a request is in flight or already finished", () => {
        expect(canSubmitDraft({ canSend: true, body: "hi", status: "sending" })).toBe(false)
        expect(canSubmitDraft({ canSend: true, body: "hi", status: "saving" })).toBe(false)
        expect(canSubmitDraft({ canSend: true, body: "hi", status: "sent" })).toBe(false)
        expect(canSubmitDraft({ canSend: true, body: "hi", status: "saved" })).toBe(false)
    })
})
