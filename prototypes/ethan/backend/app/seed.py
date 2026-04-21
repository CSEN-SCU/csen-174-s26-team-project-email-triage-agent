from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import EmailRow, TaskRow


def seed_if_empty(db: Session) -> None:
    email_count = db.scalar(select(func.count()).select_from(EmailRow))
    if email_count:
        return

    emails: list[EmailRow] = [
        EmailRow(
            id="email-1",
            sender="John Doe",
            sender_email="john.doe@example.com",
            subject="Meeting Reminder",
            sent_at="Mon, Apr 7, 2026 · 9:12 AM",
            priority="High",
            summary="Client meeting tomorrow at 10 AM",
            body="""Hi team,

Quick reminder that we have the Acme client check-in tomorrow at 10:00 AM PT (Zoom link in calendar).

Please come with:
- Updated timeline for Milestone 2
- Open risks / blockers (even small ones)

If you can't make it, let me know today so we can async you in.

Thanks,
John""",
            actions=["Prepare agenda", "Send reminder email"],
            meetings=["Client meeting", "Team meeting"],
        ),
        EmailRow(
            id="email-2",
            sender="Jane Smith",
            sender_email="jane.smith@example.com",
            subject="Project Update",
            sent_at="Sun, Apr 6, 2026 · 4:45 PM",
            priority="Medium",
            summary="Project update for the week",
            body="""Hello everyone,

Here's a concise weekly update for the dashboard redesign:

Shipped
- New inbox layout prototype (internal review)
- Task list sorting by due date

In progress
- Wiring mock data to API shapes (types are stable)

Next week
- Start on notification preferences mockups

Ping me on Slack if you want the deck with screenshots.

— Jane""",
            actions=["Review progress", "Schedule meeting"],
            meetings=["Project meeting", "Client meeting"],
        ),
        EmailRow(
            id="email-3",
            sender="Bob Johnson",
            sender_email="bob.johnson@example.com",
            subject="Invoice Payment",
            sent_at="Fri, Apr 4, 2026 · 11:03 AM",
            priority="Low",
            summary="Invoice payment due next week",
            body="""Hi,

Invoice #INV-2026-0442 for $4,850.00 is attached (PDF). Payment terms: Net 14.

Please confirm once processed so we can close the PO on our side.

Regards,
Bob Johnson
Accounts Payable""",
            actions=["Review invoice", "Send payment reminder"],
            meetings=[],
        ),
        EmailRow(
            id="email-4",
            sender="Alice Johnson",
            sender_email="alice.johnson@example.com",
            subject="Re: Q2 planning — notes",
            sent_at="Tue, Apr 8, 2026 · 8:20 AM",
            priority="High",
            summary="Client meeting tomorrow at 10 AM",
            body="""Following up on yesterday's thread: I've consolidated everyone's comments into a single doc (link: [mock] /planning/q2-notes).

Key decisions we still need:
1) Hiring freeze exception for one contractor role?
2) Whether marketing launch moves to May 2.

Can we resolve (1) async by EOD?

Alice""",
            actions=["Prepare agenda", "Send reminder email"],
            meetings=["Client meeting", "Team meeting"],
        ),
        EmailRow(
            id="email-5",
            sender="John Doe",
            sender_email="john.doe@example.com",
            subject="Lunch this week?",
            sent_at="Tue, Apr 8, 2026 · 12:01 PM",
            priority="High",
            summary="Client meeting tomorrow at 10 AM",
            body="""Hey — are you free Thursday for a quick lunch near the office? I'd like to catch up outside of standup.

No worries if not; we can do a 15m Zoom instead.

John""",
            actions=["Prepare agenda", "Send reminder email"],
            meetings=["Client meeting", "Team meeting"],
        ),
        EmailRow(
            id="email-6",
            sender="John Doe",
            sender_email="john.doe@example.com",
            subject="Action needed: sign-off on release notes",
            sent_at="Wed, Apr 9, 2026 · 3:30 PM",
            priority="High",
            summary="Client meeting tomorrow at 10 AM",
            body="""Team,

Release v1.4.0 is scheduled for Friday. I need sign-off on the customer-facing release notes by Thursday 5 PM PT.

Draft is here: [mock] /releases/1.4.0/notes

Please reply "approved" or leave edits inline.

John""",
            actions=["Prepare agenda", "Send reminder email"],
            meetings=["Client meeting", "Team meeting"],
        ),
    ]
    db.add_all(emails)

    tasks: list[TaskRow] = [
        TaskRow(
            id="task-1",
            text="Reply to client proposal",
            due_date="2026-04-12",
            completed=False,
        ),
        TaskRow(
            id="task-2",
            text="Confirm Friday meeting",
            due_date="2026-04-11",
            completed=False,
        ),
        TaskRow(
            id="task-3",
            text="Review invoice and send payment reminder",
            due_date="2026-04-09",
            completed=True,
        ),
        TaskRow(
            id="task-4",
            text="Prepare agenda for client sync",
            due_date="2026-04-14",
            completed=False,
        ),
        TaskRow(
            id="task-5",
            text="Follow up on project timeline",
            due_date="2026-04-11",
            completed=False,
        ),
    ]
    db.add_all(tasks)
    db.commit()
