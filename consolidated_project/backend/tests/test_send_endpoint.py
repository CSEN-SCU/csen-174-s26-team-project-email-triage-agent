import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app


class SendEndpointTest(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)

    def test_send_requires_auth_token(self) -> None:
        res = self.client.post("/api/send", json={"email_id": "e1", "body": "hi"})
        self.assertEqual(res.status_code, 401, msg=res.text)

    def test_draft_requires_auth_token(self) -> None:
        res = self.client.post("/api/draft", json={"email_id": "e1", "body": "hi"})
        self.assertEqual(res.status_code, 401, msg=res.text)

    def test_send_rejects_empty_body(self) -> None:
        res = self.client.post(
            "/api/send",
            json={"email_id": "e1", "body": ""},
            headers={"authorization": "Bearer fake-token"},
        )
        self.assertEqual(res.status_code, 422, msg=res.text)

    def test_send_success_with_mocked_gmail(self) -> None:
        async def fake_send(token, email_id, body):
            return {"id": "sent123", "thread_id": "t1"}

        with patch("app.api.routes.send_reply", side_effect=fake_send):
            res = self.client.post(
                "/api/send",
                json={"email_id": "e1", "body": "Sounds good."},
                headers={"authorization": "Bearer fake-token"},
            )
        self.assertEqual(res.status_code, 200, msg=res.text)
        self.assertEqual(
            res.json(), {"id": "sent123", "thread_id": "t1", "status": "sent"}
        )

    def test_draft_success_with_mocked_gmail(self) -> None:
        async def fake_draft(token, email_id, body):
            return {"draft_id": "draft456"}

        with patch("app.api.routes.create_draft_reply", side_effect=fake_draft):
            res = self.client.post(
                "/api/draft",
                json={"email_id": "e1", "body": "Draft this."},
                headers={"authorization": "Bearer fake-token"},
            )
        self.assertEqual(res.status_code, 200, msg=res.text)
        self.assertEqual(
            res.json(), {"draft_id": "draft456", "status": "draft_saved"}
        )


if __name__ == "__main__":
    unittest.main()
