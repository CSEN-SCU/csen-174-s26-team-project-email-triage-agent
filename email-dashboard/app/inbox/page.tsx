"use client"

import { Card, CardContent } from "@/components/ui/card"
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion"
import EmailCard from "@/components/emailcard"
import { emails } from "@/data/emails"
import { Email } from "@/types/email"
import { useState } from "react"
import { Circle } from "lucide-react"
import ResizablePanel from "@/components/resizablepanel"

export default function Home() {
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)

    // FUTURE:
    // const weeklyInsights = await fetch("/api/weekly-insights")
    // OR from agent:
    // const weeklyInsights = agent.generateWeeklyInsights(emails)
    const weeklyInsights = [
        "3 high-priority emails require responses",
        "2 meetings scheduled this week",
        "1 contract deadline approaching",
        "5 low-priority emails filtered out",
    ]

    // FUTURE:
    // const tasks = await fetch("/api/tasks")
    // OR:
    // const tasks = agent.extractTasks(emails)
    const tasks = [
        { id: 1, text: "Reply to client proposal" },
        { id: 2, text: "Confirm Friday meeting" },
    ]

    return (
        <div className="flex flex-col h-screen">

            {/* HEADER */}
            <div className="fixed top-0 left-0 w-full bg-gray-100 p-4 shadow-sm flex items-center justify-between z-50">
                <h1 className="text-xl font-bold">Email Triage</h1>

                {/* BUTTONS PLACEHOLDERS */}
                <div className="flex items-center gap-3">

                    {/* Search (future: global email + task search) */}
                    <div className="w-28 h-9 bg-white border border-black-300 rounded-md shadow-sm" />

                    {/* Filter (future: priority / category filters) */}
                    <div className="w-20 h-9 bg-white border border-black-300 rounded-md shadow-sm" />

                    {/* AI Actions (future: summarize all, generate tasks, etc.) */}
                    <div className="w-32 h-9 bg-white border border-black-300 rounded-md shadow-sm" />

                    {/* Notifications (future: urgent email alerts) */}
                    <div className="w-10 h-9 bg-white border border-black-300 rounded-md shadow-sm" />

                    {/* Settings (future: onboarding config + rules tuning) */}
                    <div className="w-20 h-9 bg-white border border-black-300 rounded-md shadow-sm" />

                </div>
            </div>

            {/* EMAIL LIST AND AI SUMMARY */}
            <div className="pt-20 p-6 flex h-screen gap-6">
                {/* LEFT: Email List */}
                <div className="flex-1 overflow-auto space-y-4">
                    <h1 className="text-3xl font-bold underline sticky bg-white top-0 z-10 p-2">
                        Inbox
                    </h1>

                    {emails.map((email) => (
                        <EmailCard
                            key={email.id}
                            email={email}
                            onClick={() => setSelectedEmail(email)}
                        />
                    ))}
                </div>

                {/* RIGHT: Details Panel */}
                <ResizablePanel minWidth={200} maxWidth={500} initialWidth={300}>
                    <div className="overflow-auto space-y-4 border-l border-gray-200 p-2">
                        {/* OVERVIEW MODE */}
                        {!selectedEmail ? (
                            <>
                                <h1 className="text-3xl font-bold underline">
                                    Weekly Overview
                                </h1>

                                {/* INSIGHTS */}
                                <Card>
                                    <CardContent className="p-4 space-y-2">
                                        <h2 className="font-semibold">Key Insights</h2>
                                        {weeklyInsights.map((insight, i) => (
                                            <p key={i} className="text-sm">
                                                • {insight}
                                            </p>
                                        ))}
                                    </CardContent>
                                </Card>

                                {/* TASKS */}
                                <Card>
                                    <CardContent className="p-4 space-y-2">
                                        <h2 className="font-semibold">Important Tasks</h2>
                                        {tasks.map((task) => (
                                            <p key={task.id} className="text-sm">
                                                • {task.text}
                                            </p>
                                        ))}
                                    </CardContent>
                                </Card>
                            </>
                        ) : (
                            /* EMAIL DETAIL MODE */
                            <>
                                <h1 className="text-3xl font-bold underline">
                                    AI Summary
                                </h1>

                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    {selectedEmail.subject}

                                    <Circle
                                        className={`w-3 h-3 rounded-full ${selectedEmail.priority === "High"
                                            ? "bg-red-500"
                                            : selectedEmail.priority === "Medium"
                                                ? "bg-yellow-500"
                                                : "bg-green-500"
                                            }`}
                                    />
                                </h2>

                                <Card>
                                    <CardContent className="p-4 space-y-2">
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
                                            <ul className="list-disc ml-5">
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
                                                <ul className="list-disc ml-5">
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

                                    <div className="pt-4">
                                        <button
                                            onClick={() => setSelectedEmail(null)}
                                            className="text-sm underline text-gray-600 hover:text-black"
                                        >
                                            ← Back to overview
                                        </button>
                                    </div>
                                </Accordion>
                            </>
                        )}
                    </div>
                </ResizablePanel>
            </div>
        </div>
    )
}