"use client"

import { Card, CardContent } from "@/components/ui/card"
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion"
import EmailCard from "@/components/emailcard"
import { emails as emailsMock } from "@/data/emails"
import { tasks as tasksMock } from "@/data/tasks"
import {
    analyzeEmail,
    fetchEmails,
    fetchTasks,
    fetchWeeklyInsights,
    getTriageApiBaseUrl,
    patchTask,
} from "@/lib/triage-api"
import { Email, Task } from "@/types/email"
import { useEffect, useMemo, useState } from "react"
import { Circle, Loader2 } from "lucide-react"
import ResizablePanel from "@/components/resizablepanel"

/*
 * Data / backend
 * ---------------------------------------------------------------------------
 * Loads `Email` / `Task` shapes from the FastAPI service (`GET /api/emails`,
 * `GET /api/tasks`, `GET /api/insights/weekly`). Task toggles call `PATCH /api/tasks/:id`.
 * Optional `POST /api/emails/:id/analyze` updates persisted triage fields when the API is up.
 * If the API is unreachable, the page falls back to `@/data/emails` and `@/data/tasks` so the UI still runs.
 * ---------------------------------------------------------------------------
 */

const weeklyInsightsMock = [
    "3 high-priority emails require responses",
    "2 meetings scheduled this week",
    "1 contract deadline approaching",
    "5 low-priority emails filtered out",
]

function todayYyyyMmDd(): string {
    const d = new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
}

function formatDueDateLabel(iso: string): string {
    const [y, mo, da] = iso.split("-").map(Number)
    if (!y || !mo || !da) return iso
    return new Date(y, mo - 1, da).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
    })
}

type LoadState = "loading" | "ready"

type DataSource = "api" | "mock"

export default function Home() {
    const [loadState, setLoadState] = useState<LoadState>("loading")
    const [dataSource, setDataSource] = useState<DataSource>("mock")
    const [apiBanner, setApiBanner] = useState<string | null>(null)

    const [emails, setEmails] = useState<Email[]>([])
    const [tasks, setTasks] = useState<Task[]>([])
    const [weeklyInsights, setWeeklyInsights] = useState<string[]>([])

    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
    const [view, setView] = useState("inbox")
    const [analyzeBusy, setAnalyzeBusy] = useState(false)
    const [analyzeError, setAnalyzeError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        async function load() {
            setLoadState("loading")
            setApiBanner(null)
            try {
                const [em, ta, wi] = await Promise.all([
                    fetchEmails(),
                    fetchTasks(),
                    fetchWeeklyInsights(),
                ])
                if (cancelled) return
                setEmails(em)
                setTasks(ta)
                setWeeklyInsights(wi)
                setDataSource("api")
            } catch {
                if (cancelled) return
                setEmails(emailsMock)
                setTasks(tasksMock)
                setWeeklyInsights(weeklyInsightsMock)
                setDataSource("mock")
                setApiBanner(
                    `Could not reach the triage API at ${getTriageApiBaseUrl()}. Showing static mock data — start the backend (uvicorn) or set NEXT_PUBLIC_TRIAGE_API_BASE_URL.`,
                )
            } finally {
                if (!cancelled) setLoadState("ready")
            }
        }
        void load()
        return () => {
            cancelled = true
        }
    }, [])

    useEffect(() => {
        setSelectedEmail((current) => {
            if (!current) return current
            const fresh = emails.find((e) => e.id === current.id)
            return fresh ?? current
        })
    }, [emails])

    const sortedTasks = useMemo(
        () => [...tasks].sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
        [tasks],
    )

    const toggleTaskComplete = async (id: string) => {
        const row = tasks.find((t) => t.id === id)
        if (!row) return
        const next = !Boolean(row.completed)

        if (dataSource === "mock") {
            setTasks((prev) =>
                prev.map((t) => (t.id === id ? { ...t, completed: next } : t)),
            )
            return
        }

        setTasks((prev) =>
            prev.map((t) => (t.id === id ? { ...t, completed: next } : t)),
        )
        try {
            const updated = await patchTask(id, next)
            setTasks((prev) =>
                prev.map((t) =>
                    t.id === id ? { ...t, completed: updated.completed ?? next } : t,
                ),
            )
        } catch {
            setTasks((prev) =>
                prev.map((t) => (t.id === id ? { ...t, completed: !next } : t)),
            )
        }
    }

    const onReanalyze = async () => {
        if (!selectedEmail || dataSource !== "api") return
        setAnalyzeError(null)
        setAnalyzeBusy(true)
        try {
            const updated = await analyzeEmail(selectedEmail.id)
            setEmails((prev) =>
                prev.map((e) => (e.id === updated.id ? updated : e)),
            )
            setSelectedEmail(updated)
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Analyze failed"
            setAnalyzeError(msg)
        } finally {
            setAnalyzeBusy(false)
        }
    }

    const today = todayYyyyMmDd()

    return (
        <div className="flex h-screen min-h-0 flex-col">

            {/* Top chrome: header + nav (+ inbox title when inbox) — does not scroll */}
            <div className="fixed inset-x-0 top-0 z-50 flex flex-col bg-gray-100 shadow-sm">
                {/* HEADER */}
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
                    <h1 className="text-xl font-bold">Email Triage Agent</h1>

                    {/* BUTTONS PLACEHOLDERS */}
                    <div className="flex items-center gap-3">
                        {/* Search (future: global email + task search) */}
                        <div className="w-28 h-9 rounded-md border border-black-300 bg-white shadow-sm" />

                        {/* Filter (future: priority / category filters) */}
                        <div className="w-20 h-9 rounded-md border border-black-300 bg-white shadow-sm" />

                        {/* Notifications (future: urgent email alerts) */}
                        <div className="w-10 h-9 rounded-md border border-black-300 bg-white shadow-sm" />

                        {/* Settings (future: onboarding config + rules tuning) */}
                        <div className="w-10 h-9 rounded-md border border-black-300 bg-white shadow-sm" />
                    </div>
                </div>

                {/* NAV BUTTONS */}
                <div className="flex gap-4 border-b border-gray-200 bg-gray-100 px-6 py-2">
                    <button type="button" onClick={() => setView("inbox")}>
                        Inbox
                    </button>
                    <button type="button" onClick={() => setView("overview")}>
                        Overview
                    </button>
                    <button type="button" onClick={() => setView("tasks")}>
                        Tasks
                    </button>
                </div>

                {view === "inbox" && (
                    <div className="border-b border-gray-200 bg-white px-6 py-3">
                        <h1 className="text-3xl font-bold underline">Inbox</h1>
                    </div>
                )}

                {view === "overview" && (
                    <div className="border-b border-gray-200 bg-white px-6 py-3">
                        <h1 className="text-3xl font-bold underline">Weekly Overview</h1>
                    </div>
                )}

                {view === "tasks" && (
                    <div className="border-b border-gray-200 bg-white px-6 py-3">
                        <h1 className="text-3xl font-bold underline">Important Tasks</h1>
                    </div>
                )}
            </div>

            {/* Clears fixed top chrome (tune h-* if header/nav/title wrap on small screens) */}
            {view === "inbox" && (
                <div
                    className={`shrink-0 ${view === "inbox" ? "h-[11.25rem]" : "h-[7.25rem]"}`}
                    aria-hidden
                />
            )}

            {view === "overview" && (
                <div
                    className={`shrink-0 ${view === "overview" ? "h-[11.25rem]" : "h-[7.25rem]"}`}
                    aria-hidden
                />
            )}

            {view === "tasks" && (
                <div
                    className={`shrink-0 ${view === "tasks" ? "h-[11.25rem]" : "h-[7.25rem]"}`}
                    aria-hidden
                />
            )}

            {apiBanner ? (
                <div className="shrink-0 border-b border-amber-200 bg-amber-50 px-6 py-2 text-sm text-amber-950">
                    {apiBanner}
                </div>
            ) : null}

            {loadState === "loading" ? (
                <div className="flex min-h-0 flex-1 items-center justify-center gap-2 text-gray-600">
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                    <span>Loading inbox…</span>
                </div>
            ) : null}

            {/* EMAIL LIST AND AI SUMMARY */}
            {loadState === "ready" && view === "inbox" && (
                <div className="flex min-h-0 flex-1 gap-6 overflow-hidden px-6 pb-6">
                    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1 pt-2">
                        {selectedEmail ? (
                            <div className="space-y-4">
                                <button
                                    type="button"
                                    onClick={() => setSelectedEmail(null)}
                                    className="text-sm font-medium text-gray-700 underline decoration-gray-300 underline-offset-2 hover:text-gray-900"
                                >
                                    ← Back to inbox
                                </button>

                                <div className="space-y-1 border-b border-gray-100 pb-4">
                                    <h2 className="text-2xl font-bold leading-tight">
                                        {selectedEmail.subject}
                                    </h2>
                                    <p className="text-sm text-gray-700">
                                        <span className="font-medium">{selectedEmail.sender}</span>
                                        <span className="text-gray-500"> · {selectedEmail.email}</span>
                                    </p>
                                    {selectedEmail.sentAt ? (
                                        <p className="text-xs text-gray-500">{selectedEmail.sentAt}</p>
                                    ) : null}
                                </div>

                                <Card>
                                    <CardContent className="p-4">
                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                            Message
                                        </p>
                                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-900">
                                            {selectedEmail.body}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            emails.map((email) => (
                                <EmailCard
                                    key={email.id}
                                    email={email}
                                    onClick={() => setSelectedEmail(email)}
                                />
                            ))
                        )}
                    </div>

                    <ResizablePanel minWidth={200} maxWidth={500} initialWidth={300}>
                        <div className="overflow-auto space-y-4 border-l border-gray-200 p-2">
                            {!selectedEmail ? (
                                <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-200 bg-gray-50/50 px-4 py-8 text-center">
                                    <p className="text-3xl font-bold underline">
                                        AI summary
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Select an email from the list to see its summary and actions.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <h1 className="text-3xl font-bold underline">
                                            AI Summary
                                        </h1>
                                        {dataSource === "api" ? (
                                            <button
                                                type="button"
                                                onClick={() => void onReanalyze()}
                                                disabled={analyzeBusy}
                                                className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                {analyzeBusy ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                                                ) : null}
                                                Re-analyze with AI
                                            </button>
                                        ) : null}
                                    </div>
                                    {analyzeError ? (
                                        <p className="text-sm text-red-600" role="alert">
                                            {analyzeError}
                                        </p>
                                    ) : null}

                                    <h2 className="flex items-center gap-2 text-lg font-bold">
                                        {selectedEmail.subject}

                                        <Circle
                                            className={`h-3 w-3 rounded-full ${selectedEmail.priority === "High"
                                                ? "bg-red-500"
                                                : selectedEmail.priority === "Medium"
                                                    ? "bg-yellow-500"
                                                    : "bg-green-500"
                                                }`}
                                        />
                                    </h2>

                                    <Card>
                                        <CardContent className="space-y-2 p-4">
                                            <p className="text-sm">
                                                {selectedEmail.summary}
                                            </p>
                                            <p className="text-sm">
                                                From: {selectedEmail.sender}
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Accordion type="multiple">

                                        <AccordionItem value="actions">
                                            <AccordionTrigger>Action Items</AccordionTrigger>
                                            <AccordionContent>
                                                <ul className="ml-5 list-disc">
                                                    {selectedEmail.actions.map((a, i) => (
                                                        <li key={i}>{a}</li>
                                                    ))}
                                                </ul>
                                            </AccordionContent>
                                        </AccordionItem>

                                        <AccordionItem value="meetings">
                                            <AccordionTrigger>Meetings</AccordionTrigger>
                                            <AccordionContent>
                                                {selectedEmail.meetings.length > 0 ? (
                                                    <ul className="ml-5 list-disc">
                                                        {selectedEmail.meetings.map((m, i) => (
                                                            <li key={i}>{m}</li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="text-sm text-gray-500">
                                                        No meetings
                                                    </p>
                                                )}
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </>
                            )}
                        </div>
                    </ResizablePanel>
                </div>
            )}

            {loadState === "ready" && view === "overview" && (
                <div className="min-h-0 flex-1 overflow-y-auto p-6">
                    <Card>
                        <CardContent className="space-y-2 p-4">
                            {weeklyInsights.map((i, idx) => (
                                <p key={idx}>• {i}</p>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            )}

            {loadState === "ready" && view === "tasks" && (
                <div className="min-h-0 flex-1 overflow-y-auto p-6">

                    <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <p className="text-sm text-gray-500">Sorted by due date (soonest first)</p>
                    </div>

                    <Card>
                        <CardContent className="p-2 sm:p-4">
                            <ul className="divide-y divide-gray-100 rounded-md border border-gray-100">
                                {sortedTasks.map((t) => {
                                    const done = Boolean(t.completed)
                                    const overdue = !done && t.dueDate < today
                                    return (
                                        <li key={t.id}>
                                            <label
                                                htmlFor={`task-${t.id}`}
                                                className="flex cursor-pointer items-start gap-3 px-3 py-3 hover:bg-gray-50"
                                            >
                                                <input
                                                    id={`task-${t.id}`}
                                                    type="checkbox"
                                                    className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-gray-900 focus:ring-gray-400"
                                                    checked={done}
                                                    onChange={() => void toggleTaskComplete(t.id)}
                                                />
                                                <span className="min-w-0 flex-1">
                                                    <span
                                                        className={`block text-sm font-medium ${done
                                                            ? "text-gray-400 line-through"
                                                            : "text-gray-900"
                                                            }`}
                                                    >
                                                        {t.text}
                                                    </span>
                                                </span>
                                                <span
                                                    className={`shrink-0 text-right text-xs sm:text-sm ${done
                                                        ? "text-gray-400"
                                                        : overdue
                                                            ? "font-medium text-red-600"
                                                            : "text-gray-600"
                                                        }`}
                                                >
                                                    {overdue && !done ? "Overdue · " : null}
                                                    {formatDueDateLabel(t.dueDate)}
                                                </span>
                                            </label>
                                        </li>
                                    )
                                })}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
