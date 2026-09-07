# Security Policy

## Reporting Vulnerabilities

The TerraMind team takes security and data sovereignty seriously. If you discover a security vulnerability within TerraMind or any of its submodules, **please do not report it in a public GitHub issue**.

Instead, please send an encrypted or direct disclosure email to:
`security@terramind.org` (or contact the core maintainer privately via GitHub security advisories).

Please include:
1. A description of the vulnerability.
2. Steps or proof-of-concept to reproduce the issue.
3. Affected versions or components (e.g., API router, PostGIS query builder, or LLM prompt injection).
4. Any potential mitigations you have identified.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

## Security Guidelines for Developers & Agents
- Never commit credentials, `.env` files, or production API tokens.
- Parameterize all spatial queries; never concatenate un-sanitized user strings into raw SQL.
- Validate and sanitize all external GeoJSON payloads to prevent Denial of Service via deeply nested polygon vertices.
