# ADR-002: Deterministic simulation instead of LLM output

- Status: accepted
- Date: 2026-10-04

## Context

AQI values and GRAP advisories must be reproducible in demos, tests, and CI.
LLM calls are non-deterministic, need keys, and fail offline.

## Decision

Seed every synthetic value with `7331`. AQI per zone is a pure function of
`(seed, zone name, index)`; GRAP stage is a pure function of AQI. No network
calls at build time, no model calls on the hot path.

## Consequences

- Tests assert exact stage boundaries without mocks.
- Demo never flakes; reviewers see the same numbers.
- Live CPCB feed can replace the simulator later behind the same shapes
  (see roadmap `docs/diagrams/roadmap.mmd`).
