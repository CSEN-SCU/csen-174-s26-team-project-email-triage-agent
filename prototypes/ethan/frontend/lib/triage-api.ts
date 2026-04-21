import type { Email, Task } from "@/types/email"

/** Base URL for `prototypes/ethan/backend` (no trailing slash). */
export function getTriageApiBaseUrl(): string {
    const v = process.env.NEXT_PUBLIC_TRIAGE_API_BASE_URL
    if (v && v.trim()) return v.replace(/\/$/, "")
    return "http://127.0.0.1:8000"
}

async function readJson<T>(res: Response): Promise<T> {
    const text = await res.text()
    if (!res.ok) {
        throw new Error(text || `${res.status}`)
    }
    return JSON.parse(text) as T
}

export async function fetchEmails(): Promise<Email[]> {
    const res = await fetch(`${getTriageApiBaseUrl()}/api/emails`)
    return readJson<Email[]>(res)
}

export async function fetchTasks(): Promise<Task[]> {
    const res = await fetch(`${getTriageApiBaseUrl()}/api/tasks`)
    return readJson<Task[]>(res)
}

export async function fetchWeeklyInsights(): Promise<string[]> {
    const res = await fetch(`${getTriageApiBaseUrl()}/api/insights/weekly`)
    return readJson<string[]>(res)
}

export async function patchTask(id: string, completed: boolean): Promise<Task> {
    const res = await fetch(`${getTriageApiBaseUrl()}/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
    })
    return readJson<Task>(res)
}

export async function analyzeEmail(id: string): Promise<Email> {
    const res = await fetch(`${getTriageApiBaseUrl()}/api/emails/${id}/analyze`, {
        method: "POST",
    })
    return readJson<Email>(res)
}
