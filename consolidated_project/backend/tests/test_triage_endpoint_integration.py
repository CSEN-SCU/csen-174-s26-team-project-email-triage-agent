import unittest
from datetime import datetime, timezone
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.api import routes
from app.main import app
from app.models.email import (
    ActionItem, Bucket, Email, Intent, TriageResult, TriageSignal,
)


def _email(eid: str) -> Email:
    return Email(
        id=eid, thread_id=f"t-{eid}", sender_name="Buyer",
        sender_email="buyer@acme.com", subject="Subj", body="Body",
        received_at=datetime.now(timezone.utc),
    )


async def _fake_select(ids, token):
    return [_email(i) for i in (ids or ["e1"])]


def _fake_result(email, bucket=Bucket.ACT_TODAY):
    return TriageResult(
        email_id=email.id,
        signal=TriageSignal(intent=Intent.DEAL, priority=85, bucket=bucket, reason="r"),
        summary="summary", actions=[ActionItem(kind="reply", label="Reply")],
        draft_reply="hi",
    )


class TriageEndpointIntegrationTest(unittest.TestCase):
    """POST /api/triage and /api/triage/stream with the orchestrator stubbed."""

    def setUp(self) -> None:
        self.client = TestClient(app)

    def test_triage_returns_bucketed_digest(self) -> None:
        async def fake_triage(email, user_context, token):
            return _fake_result(email)

        original = routes._user_context
        try:
            with patch("app.api.routes._select_emails", side_effect=_fake_select), \
                 patch("app.api.routes.triage_email", side_effect=fake_triage):
                res = self.client.post("/api/triage", json={"email_ids": ["e1", "e7"]})
        finally:
            routes._user_context = original

        self.assertEqual(res.status_code, 200, msg=res.text)
        payload = res.json()
        all_results = payload["act_today"] + payload["decide_this_week"] + payload["fyi"]
        self.assertEqual({r["email_id"] for r in all_results}, {"e1", "e7"})
        for r in all_results:
            self.assertEqual(r["signal"]["bucket"], "act_today")
            self.assertTrue(r["summary"])

    def test_triage_stream_emits_result_and_done(self) -> None:
        async def fake_triage(email, user_context, token):
            return _fake_result(email, bucket=Bucket.FYI)

        with patch("app.api.routes._select_emails", side_effect=_fake_select), \
             patch("app.api.routes.triage_email", side_effect=fake_triage):
            res = self.client.post("/api/triage/stream", json={"email_ids": ["e1"]})

        self.assertEqual(res.status_code, 200, msg=res.text)
        body = res.text
        self.assertIn("event: start", body)
        self.assertIn("event: result", body)
        self.assertIn("event: done", body)


if __name__ == "__main__":
    unittest.main()
