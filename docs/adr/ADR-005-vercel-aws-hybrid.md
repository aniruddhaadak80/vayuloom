# ADR-005: Vercel + AWS hybrid hosting

- Status: accepted
- Date: 2026-10-07

## Context

The web dashboard needs global edge delivery (primary region `bom1` for
Indian schools), while the autopilot engine and data layer belong on AWS
services eligible under the hackathon's AWS track.

## Decision

Host Next.js on Vercel (regions `bom1`, `iad1`) and run the autopilot engine
on AWS Lambda + API Gateway with DynamoDB, S3, CloudFront, and SNS. Python
agents run as a container beside the web app (see `fly.toml`,
`render.yaml`) and behind API Gateway in AWS.

## Consequences

- Dashboard stays fast for Delhi schools; AWS usage stays track-eligible.
- Two deploy targets means two health checks (`/api/health`, `/healthz`).
- Environment wiring (`PYTHON_URL`, `PORT`) is the only cross-host config.
