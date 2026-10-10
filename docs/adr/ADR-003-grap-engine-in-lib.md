# ADR-003: GRAP engine lives in the shared library

- Status: accepted
- Date: 2026-10-05

## Context

Two API surfaces (Next.js `/api/autopilot` and the Python agents service)
must agree on GRAP stages and advisory text. Duplicated `if/else` chains
drift.

## Decision

Keep the canonical GRAP band table and action lists in one library module.
The Next.js route and the FastAPI service each hold a thin, dependency-free
copy for the hackathon slice, with identical thresholds covered by parallel
vitest + pytest suites so drift is caught in CI.

## Consequences

- One band table to review with domain experts.
- CI runs both suites; a threshold change must update both.
- Post-event: extract to a versioned package both runtimes import.
