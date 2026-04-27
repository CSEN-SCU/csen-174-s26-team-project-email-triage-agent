import json
from huggingface_hub import InferenceClient

from app.config import settings
from app.schemas import TriageJson


def triage_with_hf(
    *,
    subject: str,
    sender: str,
    sender_email: str,
    body: str,
) -> TriageJson:
    if not settings.hf_api_key.strip():
        raise ValueError("HF_API_KEY is not set")

    client = InferenceClient(api_key=settings.hf_api_key)

    system = (
        "You are an email triage assistant for busy founders. "
        "Return ONLY a valid JSON object (no markdown, no explanation) with keys: "
        'summary (one short paragraph), priority ("High"|"Medium"|"Low"), '
        "actions (array of short imperative strings), "
        "meetings (array of strings; empty if none). "
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

    try:
        completion = client.chat.completions.create(
            model="meta-llama/Llama-3.2-1B-Instruct:novita",
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            max_tokens=300,
        )

        raw = completion.choices[0].message.content or "{}"

        # Try parsing safely
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            # fallback: attempt to extract JSON substring
            start = raw.find("{")
            end = raw.rfind("}") + 1
            data = json.loads(raw[start:end]) if start != -1 else {}

        triage = TriageJson.model_validate(data)

        if triage.priority not in ("High", "Medium", "Low"):
            triage = triage.model_copy(update={"priority": "Medium"})

        return triage

    except Exception as e:
        print(f"[HF Triage Failed]: {e}")
        # fallback minimal object
        return TriageJson(
            summary="HF Error",
            priority="Low",
            actions=[],
            meetings=[],
        )