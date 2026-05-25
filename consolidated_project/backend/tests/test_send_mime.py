import base64
import email.policy
import unittest
from email import message_from_bytes

from app.auth.gmail import _build_reply_mime, _reply_subject


def _decode_raw(raw: str):
    return message_from_bytes(
        base64.urlsafe_b64decode(raw.encode("utf-8")),
        policy=email.policy.default,
    )


class ReplySubjectTest(unittest.TestCase):
    def test_prefixes_re_when_absent(self) -> None:
        self.assertEqual(_reply_subject("Q3 numbers"), "Re: Q3 numbers")

    def test_does_not_double_existing_re(self) -> None:
        self.assertEqual(_reply_subject("Re: Q3 numbers"), "Re: Q3 numbers")
        self.assertEqual(_reply_subject("RE: hello"), "RE: hello")

    def test_empty_subject_becomes_bare_re(self) -> None:
        self.assertEqual(_reply_subject(""), "Re:")


class BuildReplyMimeTest(unittest.TestCase):
    def test_sets_recipient_subject_and_body(self) -> None:
        raw = _build_reply_mime(
            to_addr="priya@bessemer.com",
            subject="Following up",
            in_reply_to="<abc123@mail.gmail.com>",
            body="Sounds good — Monday works.",
        )
        msg = _decode_raw(raw)
        self.assertEqual(msg["To"], "priya@bessemer.com")
        self.assertEqual(msg["Subject"], "Re: Following up")
        self.assertEqual(
            msg.get_content().strip(), "Sounds good — Monday works."
        )

    def test_sets_threading_headers_when_message_id_present(self) -> None:
        raw = _build_reply_mime(
            to_addr="a@b.com",
            subject="Re: hi",
            in_reply_to="<abc123@mail.gmail.com>",
            body="ok",
        )
        msg = _decode_raw(raw)
        self.assertEqual(msg["In-Reply-To"], "<abc123@mail.gmail.com>")
        self.assertEqual(msg["References"], "<abc123@mail.gmail.com>")

    def test_omits_threading_headers_when_no_message_id(self) -> None:
        raw = _build_reply_mime(
            to_addr="a@b.com", subject="hi", in_reply_to=None, body="ok"
        )
        msg = _decode_raw(raw)
        self.assertIsNone(msg["In-Reply-To"])
        self.assertIsNone(msg["References"])


if __name__ == "__main__":
    unittest.main()
