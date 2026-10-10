"""Pure-function tests for the VayuLoom agents service (no server needed)."""

import pytest
from pydantic import ValidationError

from app import (
    SEED,
    AutopilotRequest,
    autopilot_actions,
    autopilot,
    grap_stage,
    health,
)


def test_grap_stage_boundaries() -> None:
    assert grap_stage(0) == "None — Good"
    assert grap_stage(100) == "None — Good"
    assert grap_stage(101) == "Stage I — Poor"
    assert grap_stage(200) == "Stage I — Poor"
    assert grap_stage(201) == "Stage II — Very Poor"
    assert grap_stage(300) == "Stage II — Very Poor"
    assert grap_stage(301) == "Stage III — Severe"
    assert grap_stage(400) == "Stage III — Severe"
    assert grap_stage(401) == "Stage IV — Severe Plus"
    assert grap_stage(999) == "Stage IV — Severe Plus"


def test_actions_non_empty_for_every_stage() -> None:
    for aqi in (50, 150, 250, 350, 500):
        actions = autopilot_actions(grap_stage(aqi))
        assert len(actions) >= 2
        assert all(len(a) > 0 for a in actions)


def test_stage_iv_escalates_to_closure() -> None:
    actions = autopilot_actions("Stage IV — Severe Plus")
    assert "online" in " ".join(actions).lower()


def test_request_validation_rejects_bad_input() -> None:
    with pytest.raises(ValidationError):
        AutopilotRequest(aqi=1000, zoneName="X", students=1)
    with pytest.raises(ValidationError):
        AutopilotRequest(aqi=-1, zoneName="X", students=1)
    with pytest.raises(ValidationError):
        AutopilotRequest(aqi=100, zoneName="", students=1)


def test_autopilot_handler_returns_bilingual_sms() -> None:
    res = autopilot(AutopilotRequest(aqi=320, zoneName="Anand Vihar", students=1200))
    assert res.stage == "Stage III — Severe"
    assert len(res.actions) >= 2
    assert "Anand Vihar" in res.sms_en
    assert "320" in res.sms_en
    assert "Anand Vihar" in res.sms_hi


def test_health_shape() -> None:
    body = health()
    assert body["status"] == "ok"
    assert body["service"] == "vayuloom-agents"
    assert body["seed"] == SEED == 7331
    assert isinstance(body["time"], str) and len(body["time"]) > 0
