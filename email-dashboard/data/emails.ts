import { Email } from "@/types/email"

/** Mock inbox for local UI. Replace with API/RSC data when the backend stores agent-enriched emails. */
export const emails: Email[] = [
    {
        id: "email-1",
        sender: "John Doe",
        email: "john.doe@example.com",
        subject: "Meeting Reminder",
        sentAt: "Mon, Apr 7, 2026 · 9:12 AM",
        priority: "High",
        summary: "Client meeting tomorrow at 10 AM",
        body: `Hi team,

Quick reminder that we have the Acme client check-in tomorrow at 10:00 AM PT (Zoom link in calendar).

Please come with:
- Updated timeline for Milestone 2
- Open risks / blockers (even small ones)

If you can't make it, let me know today so we can async you in.

Thanks,
John`,
        actions: ["Prepare agenda", "Send reminder email"],
        meetings: ["Client meeting", "Team meeting"],
    },
    {
        id: "email-2",
        sender: "Jane Smith",
        email: "jane.smith@example.com",
        subject: "Project Update",
        sentAt: "Sun, Apr 6, 2026 · 4:45 PM",
        priority: "Medium",
        summary: "Project update for the week",
        body: `Hello everyone,

Here's a concise weekly update for the dashboard redesign:

Shipped
- New inbox layout prototype (internal review)
- Task list sorting by due date

In progress
- Wiring mock data to API shapes (types are stable)

Next week
- Start on notification preferences mockups

Ping me on Slack if you want the deck with screenshots.

— Jane`,
        actions: ["Review progress", "Schedule meeting"],
        meetings: ["Project meeting", "Client meeting"],
    },
    {
        id: "email-3",
        sender: "Bob Johnson",
        email: "bob.johnson@example.com",
        subject: "Invoice Payment",
        sentAt: "Fri, Apr 4, 2026 · 11:03 AM",
        priority: "Low",
        summary: "Invoice payment due next week",
        body: `Hi,

Invoice #INV-2026-0442 for $4,850.00 is attached (PDF). Payment terms: Net 14.

Please confirm once processed so we can close the PO on our side.

Regards,
Bob Johnson
Accounts Payable`,
        actions: ["Review invoice", "Send payment reminder"],
        meetings: [],
    },
    {
        id: "email-4",
        sender: "Alice Johnson",
        email: "alice.johnson@example.com",
        subject: "Re: Q2 planning — notes",
        sentAt: "Tue, Apr 8, 2026 · 8:20 AM",
        priority: "High",
        summary: "Client meeting tomorrow at 10 AM",
        body: `Following up on yesterday's thread: I've consolidated everyone's comments into a single doc (link: [mock] /planning/q2-notes).

Key decisions we still need:
1) Hiring freeze exception for one contractor role?
2) Whether marketing launch moves to May 2.

Can we resolve (1) async by EOD?

Alice`,
        actions: ["Prepare agenda", "Send reminder email"],
        meetings: ["Client meeting", "Team meeting"],
    },
    {
        id: "email-5",
        sender: "John Doe",
        email: "john.doe@example.com",
        subject: "Lunch this week?",
        sentAt: "Tue, Apr 8, 2026 · 12:01 PM",
        priority: "High",
        summary: "Client meeting tomorrow at 10 AM",
        body: `Hey — are you free Thursday for a quick lunch near the office? I'd like to catch up outside of standup.

No worries if not; we can do a 15m Zoom instead.

John`,
        actions: ["Prepare agenda", "Send reminder email"],
        meetings: ["Client meeting", "Team meeting"],
    },
    {
        id: "email-6",
        sender: "John Doe",
        email: "john.doe@example.com",
        subject: "Action needed: sign-off on release notes",
        sentAt: "Wed, Apr 9, 2026 · 3:30 PM",
        priority: "High",
        summary: "Client meeting tomorrow at 10 AM",
        body: `Team,

Release v1.4.0 is scheduled for Friday. I need sign-off on the customer-facing release notes by Thursday 5 PM PT.

Draft is here: [mock] /releases/1.4.0/notes

Please reply "approved" or leave edits inline.

John`,
        actions: ["Prepare agenda", "Send reminder email"],
        meetings: ["Client meeting", "Team meeting"],
    },
]
