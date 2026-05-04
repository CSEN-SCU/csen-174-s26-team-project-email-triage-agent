import type { Bucket, TriageDigest } from "./types"

const BUCKETS: readonly Bucket[] = ["act_today", "decide_this_week", "fyi"]

/** True when `value` is one of the three digest bucket names the API uses. */
export function isValidBucket(value: string): value is Bucket {
    return (BUCKETS as readonly string[]).includes(value)
}

/** Keeps triage priority in the 0–100 range the backend uses. */
export function clampTriagePriority(priority: number): number {
    return Math.min(100, Math.max(0, priority))
}

/** Total emails across Act today / Decide / FYI (matches digest card counts). */
export function countDigestEmails(
    digest: Pick<TriageDigest, "act_today" | "decide_this_week" | "fyi">
): number {
    return (
        digest.act_today.length +
        digest.decide_this_week.length +
        digest.fyi.length
    )
}
