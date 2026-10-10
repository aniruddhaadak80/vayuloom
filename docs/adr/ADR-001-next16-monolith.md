# ADR-001: Next.js 16 monolith for the web slice

- Status: accepted
- Date: 2026-10-04

## Context

VayuLoom needs a dashboard, public API routes, and deployable web surface in
one hackathon-sized unit. The team knows TypeScript and React.

## Decision

Build the web slice as a single Next.js 16 app (App Router, `output:
"standalone"`). API routes (`/api/health`, `/api/aqi`, `/api/autopilot`)
live in the same deployment as the pages.

## Consequences

- One `bun install` / `next build` covers UI + API.
- Standalone output keeps the Docker image small.
- If the API outgrows the monolith, `/api/autopilot` callers already use
  plain JSON, so extracting to Lambda/API Gateway needs no client change.
