# VayuLoom agents service (Python)

Deterministic GRAP autopilot as a Python FastAPI microservice. Mirrors the
TypeScript logic in `src/app/api/autopilot/route.ts` so the Next.js app and
the agent layer stay in agreement (seed `7331`).

## Run

```bash
cd services/agents
pip install -r requirements.txt
uvicorn app:app --port 8001
```

- Health: http://localhost:8001/health
- OpenAPI docs: http://localhost:8001/docs
- OpenAPI JSON: http://localhost:8001/openapi.json

## Endpoints

| Method | Path        | Body                                          | Returns                          |
| ------ | ----------- | --------------------------------------------- | -------------------------------- |
| GET    | `/health`   | —                                             | `{status, service, seed, time}`  |
| POST   | `/autopilot`| `{aqi 0-999, zoneName, students}`             | `{stage, actions, sms_en, sms_hi}` |

## Test

```bash
pytest test_app.py -v
```

Pure-function tests — no server needed.

## GRAP stages

| AQI       | Stage                  |
| --------- | ---------------------- |
| 0–100     | None — Good            |
| 101–200   | Stage I — Poor         |
| 201–300   | Stage II — Very Poor   |
| 301–400   | Stage III — Severe     |
| 401–999   | Stage IV — Severe Plus |
