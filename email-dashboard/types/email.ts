/** Align API/DB JSON with these shapes so the dashboard can swap mocks for fetches without retyping. */
export type Email = {
    id: string
    subject: string
    sender: string
    email: string
    /** Raw / full message text from the provider; agent may also store HTML separately later. */
    body: string
    /** Optional display string (e.g. from headers). */
    sentAt?: string
    summary: string
    priority: "High" | "Medium" | "Low"
    actions: string[]
    meetings: string[]
}

/**
 * Task row the Tasks tab expects. Backend may add fields (e.g. `emailId`); extend here when wired up.
 * Due date as `YYYY-MM-DD` (lexicographic sort === chronological).
 */
export type Task = {
    id: string
    text: string
    dueDate: string
    completed?: boolean
}