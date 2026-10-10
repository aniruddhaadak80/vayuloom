"""VayuLoom agents service — deterministic GRAP autopilot (FastAPI).

Run: uvicorn app:app --port 8001  (from services/agents/)
OpenAPI docs: http://localhost:8001/docs
"""

from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

SEED = 7331

app = FastAPI(title="vayuloom-agents", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class AutopilotRequest(BaseModel):
    aqi: int = Field(ge=0, le=999)
    zoneName: str = Field(min_length=1, max_length=80)
    students: int = Field(ge=0, le=100000)


class AutopilotResponse(BaseModel):
    stage: str
    actions: list[str]
    sms_en: str
    sms_hi: str


ACTIONS: dict[str, list[str]] = {
    "None — Good": [
        "Outdoor activities as normal",
        "Monitor AQI twice daily",
    ],
    "Stage I — Poor": [
        "Stop outdoor morning assembly",
        "Limit prolonged outdoor exertion",
        "Keep asthma medication accessible",
    ],
    "Stage II — Very Poor": [
        "Shift outdoor sports indoors",
        "Run air purifiers in classrooms",
        "Issue masks for commute",
    ],
    "Stage III — Severe": [
        "Suspend all outdoor activities",
        "Consider hybrid classes for primary sections",
        "Send daily parent advisory via SMS",
    ],
    "Stage IV — Severe Plus": [
        "Close schools / move fully online",
        "Send emergency parent alert in EN + HI",
        "Report compliance to DOE helpline",
    ],
}


def grap_stage(aqi: int) -> str:
    if aqi > 400:
        return "Stage IV — Severe Plus"
    if aqi > 300:
        return "Stage III — Severe"
    if aqi > 200:
        return "Stage II — Very Poor"
    if aqi > 100:
        return "Stage I — Poor"
    return "None — Good"


def autopilot_actions(stage: str) -> list[str]:
    return list(ACTIONS[stage])


@app.get("/health")
def health() -> dict[str, object]:
    return {
        "status": "ok",
        "service": "vayuloom-agents",
        "seed": SEED,
        "time": datetime.now(timezone.utc).isoformat(),
    }


@app.post("/autopilot", response_model=AutopilotResponse)
def autopilot(req: AutopilotRequest) -> AutopilotResponse:
    stage = grap_stage(req.aqi)
    actions = autopilot_actions(stage)
    sms_en = (
        f"VayuLoom alert for {req.zoneName}: AQI {req.aqi} ({stage}). "
        f"{actions[0]}. {req.students} students covered."
    )
    sms_hi = (
        f"VayuLoom alert: {req.zoneName} me AQI {req.aqi} ({stage}). "
        f"{actions[0]}. {req.students} chhatra surakshit."
    )
    return AutopilotResponse(stage=stage, actions=actions, sms_en=sms_en, sms_hi=sms_hi)
