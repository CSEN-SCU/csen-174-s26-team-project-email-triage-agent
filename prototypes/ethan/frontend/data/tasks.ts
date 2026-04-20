import { Task } from "@/types/email"

/**
 * Mock tasks for the Tasks tab. Backend: tasks are usually their own rows (often extracted by the
 * agent from email action items) loaded via GET /tasks, not generated into this file at runtime.
 */
export const tasks: Task[] = [
    {
        id: "task-1",
        text: "Reply to client proposal",
        dueDate: "2026-04-12",
        completed: false,
    },
    {
        id: "task-2",
        text: "Confirm Friday meeting",
        dueDate: "2026-04-11",
        completed: false,
    },
    {
        id: "task-3",
        text: "Review invoice and send payment reminder",
        dueDate: "2026-04-09",
        completed: true,
    },
    {
        id: "task-4",
        text: "Prepare agenda for client sync",
        dueDate: "2026-04-14",
        completed: false,
    },
    {
        id: "task-5",
        text: "Follow up on project timeline",
        dueDate: "2026-04-11",
        completed: false,
    },
]
