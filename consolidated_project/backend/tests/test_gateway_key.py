import pytest
from fastapi import HTTPException

from app.config import settings
from app.security.gateway import require_gateway_key


def test_allows_any_request_when_no_key_configured(monkeypatch):
    monkeypatch.setattr(settings, "gateway_key", "")
    assert require_gateway_key(None) is None
    assert require_gateway_key("anything") is None


def test_rejects_missing_key_when_configured(monkeypatch):
    monkeypatch.setattr(settings, "gateway_key", "secret")
    with pytest.raises(HTTPException) as exc:
        require_gateway_key(None)
    assert exc.value.status_code == 401


def test_rejects_wrong_key(monkeypatch):
    monkeypatch.setattr(settings, "gateway_key", "secret")
    with pytest.raises(HTTPException) as exc:
        require_gateway_key("not-the-secret")
    assert exc.value.status_code == 401


def test_allows_correct_key(monkeypatch):
    monkeypatch.setattr(settings, "gateway_key", "secret")
    assert require_gateway_key("secret") is None
