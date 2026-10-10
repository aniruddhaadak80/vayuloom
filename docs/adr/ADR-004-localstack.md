# ADR-004: LocalStack for AWS parity in CI

- Status: accepted
- Date: 2026-10-06

## Context

The production design uses Lambda, API Gateway, DynamoDB, S3, and SNS, but
CI has no AWS credentials and the demo must run offline.

## Decision

Run SAM templates against LocalStack in CI and Docker Compose locally. The
web container and the agents service both run unchanged against emulated
endpoints via environment config (`DYNAMODB_ENDPOINT`, `SNS_ENDPOINT`).

## Consequences

- Infra code is exercised on every push without cost.
- Emulator quirks are documented in `docker-compose.yml` comments.
- Load and IAM behavior are still validated in AWS pre-production.
