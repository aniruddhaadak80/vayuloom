# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | yes       |

## Reporting a vulnerability

Email the maintainer (see `SUPPORT.md`) with:

- A description of the issue and affected endpoint/file.
- Steps to reproduce (request/response pairs help).
- Your assessment of impact on school/student data.

Expect an acknowledgment within 72 hours. Please do not open public issues
for vulnerabilities involving student data or credentials.

## Scope notes

- No real student PII is stored in this repo; all AQI fixtures are synthetic
  (seed `7331`).
- Secrets belong in environment config — see `.env.example`. Never commit
  keys, tokens, or `.env` files.
