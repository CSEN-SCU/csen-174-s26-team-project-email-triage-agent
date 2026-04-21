import json

from openai import OpenAI

from app.config import settings
from app.schemas import TriageJson


def triage_with_openai(
    *,
    subject: str,
    sender: str,
    sender_email: str,
    body: str,
) -> TriageJson:
    if not settings.openai_api_key.strip():
        raise ValueError("OPENAI_API_KEY is not set")

    client = OpenAI(api_key=settings.openai_api_key)
    system = (
        "You are an email triage assistant for busy founders. "
        "Given the raw email, return a compact JSON object only (no markdown) with keys: "
        'summary (one short paragraph), priority ("High"|"Medium"|"Low"), '
        "actions (array of short imperative strings), meetings (array of strings; empty if none). "
        "Prioritize investor, client revenue, legal, and payroll issues as High when appropriate."
    )
    user = json.dumps(
        {
            "subject": subject,
            "from_name": sender,
            "from_email": sender_email,
            "body": body,
        },
        ensure_ascii=False,
    )
    completion = client.chat.completions.create(
        model=settings.openai_model,
        temperature=0.2,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    )
    raw = completion.choices[0].message.content or "{}"
    data = json.loads(raw)
    triage = TriageJson.model_validate(data)
    if triage.priority not in ("High", "Medium", "Low"):
        triage = triage.model_copy(update={"priority": "Medium"})
    return triage
