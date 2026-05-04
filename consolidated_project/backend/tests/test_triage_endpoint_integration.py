import unittest

from fastapi.testclient import TestClient

from app.api import routes
from app.config import settings
from app.main import app


def _anthropic_configured() -> bool:
    return bool((settings.api_key or "").strip())


@unittest.skipUnless(
    _anthropic_configured(),
    "Set ANTHROPIC_API_KEY or CLAUDE_API_KEY (e.g. in .env) to run live Claude integration",
)
class TriageEndpointLiveClaudeIntegrationTest(unittest.TestCase):
    """POST /api/triage through FastAPI with real LangGraph + Anthropic (no mocks)."""

    # Each email runs several model calls (classify, summarize, actions, optional draft).
    _REQUEST_TIMEOUT_S = 300.0

    def test_triage_endpoint_calls_claude_and_returns_digest(self) -> None:
        """Ask the real AI to triage two emails and prove we get back
        sensible buckets, priorities, summaries, and action lists — not a broken payload."""
        client = TestClient(app)
        original_context = routes._user_context
        user_context = "Handle customer escalations first"
        email_ids = ["e1", "e7"]

        try:
            response = client.post(
                "/api/triage",
                json={"user_context": user_context, "email_ids": email_ids},
                timeout=self._REQUEST_TIMEOUT_S,
            )
        finally:
            routes._user_context = original_context

        self.assertEqual(response.status_code, 200, msg=response.text)
        payload = response.json()

        self.assertEqual(payload["user_context"], user_context)

        all_results = (
            payload["act_today"]
            + payload["decide_this_week"]
            + payload["fyi"]
        )
        self.assertEqual(len(all_results), len(email_ids))
        self.assertEqual({r["email_id"] for r in all_results}, set(email_ids))

        for r in all_results:
            self.assertIn("signal", r)
            sig = r["signal"]
            self.assertIn(sig["bucket"], ("act_today", "decide_this_week", "fyi"))
            self.assertIsInstance(sig["priority"], int)
            self.assertGreaterEqual(sig["priority"], 0)
            self.assertLessEqual(sig["priority"], 100)
            self.assertTrue(r.get("summary", "").strip())
            self.assertIsInstance(r.get("actions"), list)


if __name__ == "__main__":
    unittest.main()
