# Contributing to VayuLoom

Thanks for helping build air safety tooling for Indian schools.

## Workflow

1. Fork and branch from `main`: `feat/<short-name>`.
2. One logical change per PR; keep diffs small.
3. Run checks before pushing:
   ```bash
   bun install
   bunx tsc --noEmit
   bunx eslint .
   bunx vitest run
   cd services/agents && pytest test_app.py -v
   ```
4. Fill in the PR template; link issues with `Fixes #<n>`.

## Conventions

- TypeScript strict mode, ESM, no `any`.
- Deterministic seed `7331` for all synthetic AQI data.
- No network calls at build time; no secrets in code (see `.env.example`).
- Match existing file layout: Agent A owns pages/components, Agent B owns
  `src/lib`, Agent C owns API routes/services/docs — check with a maintainer
  before crossing those lines.

## Reporting issues

Use the bug report / feature request templates in
`.github/ISSUE_TEMPLATE/`. Include steps to reproduce and expected AQI/stage
values where relevant.
